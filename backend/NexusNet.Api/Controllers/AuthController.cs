using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NexusNet.Api.Data;
using NexusNet.Api.Models;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using System.Text;
using System.Security.Cryptography;
using NexusNet.Api.Services.Email;
using NexusNet.Api.Services.Sessions;

namespace NexusNet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthController> _logger;
    private readonly ISessionValidationService _sessionValidation;

    public AuthController(
        AppDbContext db,
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<AuthController> logger,
        ISessionValidationService sessionValidation)
    {
        _db = db;
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
        _sessionValidation = sessionValidation;
    }

    // -----------------------------------
    // LOGIN
    // -----------------------------------
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (dto == null)
            return BadRequest("Invalid payload");

        var loginOrEmail = (dto.loginOrEmail ?? dto.email)?.Trim();

        if (string.IsNullOrEmpty(loginOrEmail) ||
            string.IsNullOrEmpty(dto.password))
            return BadRequest("Invalid payload");

        var normalizedLogin = loginOrEmail.ToLower();

        var user = await _db.Users
            .FirstOrDefaultAsync(x =>
                x.email.ToLower() == normalizedLogin ||
                x.pseudo.ToLower() == normalizedLogin);

        if (user == null)
            return Unauthorized("Invalid credentials");

        bool isValidPassword =
            BCrypt.Net.BCrypt.Verify(dto.password, user.password);

        if (!isValidPassword)
            return Unauthorized("Invalid credentials");

        if (user.emailverifie == false)
        {
            return StatusCode(403, new
            {
                message = "Vous devez valider votre adresse email avant de pouvoir vous connecter."
            });
        }

        if (user.accesblock == true)
        {
            return StatusCode(403, new
            {
                message = "L'accès à ce compte a été bloqué."
            });
        }

        if (user.suspendu == true)
        {
            return StatusCode(403, new
            {
                message = "Ce compte est suspendu."
            });
        }

        return await CreateAuthenticationAsync(user, "Login successful");
    }

    // -----------------------------------
    // DEMANDE DE RÉINITIALISATION DU MOT DE PASSE
    // -----------------------------------
    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        // Même réponse pour une adresse inconnue ou une demande trop récente.
        const string confirmation = "Si un compte correspond à cette adresse, un email de réinitialisation vous sera envoyé. Pensez à vérifier vos courriers indésirables.";
        var email = dto.email.Trim().ToLowerInvariant();
        var user = await _db.Users.AsNoTracking()
            .Where(x => x.email.ToLower() == email)
            .Select(x => new { x.id, x.email, x.pseudo })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            _logger.LogInformation("Réinitialisation du mot de passe : aucun compte correspondant dans la base utilisée par cette API.");
            return Ok(new { message = confirmation });
        }

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        var now = DateTime.UtcNow;
        var expiresAt = now.AddHours(1);
        var resendThreshold = now.AddMinutes(55);

        // Mise à jour atomique : au plus un envoi par compte toutes les cinq minutes,
        // même si plusieurs demandes arrivent simultanément.
        var updated = await _db.Users
            .Where(x => x.id == user.id &&
                (x.expirationtokenreinitialisationpassword == null ||
                 x.expirationtokenreinitialisationpassword <= resendThreshold))
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.hashtokenreinitialisationpassword, tokenHash)
                .SetProperty(x => x.expirationtokenreinitialisationpassword, expiresAt));

        if (updated == 0)
        {
            _logger.LogInformation("Réinitialisation du mot de passe : envoi ignoré pour le compte {UserId}, délai de cinq minutes entre deux demandes.", user.id);
            return Ok(new { message = confirmation });
        }

        // URL issue de la configuration serveur, jamais du Host fourni par le client.
        var frontendUrl = (_configuration["Frontend:BaseUrl"] ?? "https://alanalezca.fr").TrimEnd('/');
        var resetUrl = $"{frontendUrl}/reinitialisation-mot-de-passe?token={token}";

        try
        {
            await _emailService.SendPasswordResetAsync(user.email, user.pseudo, resetUrl);
            _logger.LogInformation("Réinitialisation du mot de passe : email accepté par le serveur SMTP pour le compte {UserId}. La livraison en boîte de réception reste à confirmer.", user.id);
        }
        catch (Exception ex)
        {
            // Ne pas journaliser le jeton, le lien ou le contenu du mail.
            _logger.LogError("Échec d’envoi de l’email de réinitialisation pour le compte {UserId} ({ErrorType}).",
                user.id, ex.GetType().Name);

            if (ex is MailKit.Net.Smtp.SmtpCommandException smtpError)
            {
                _logger.LogError("Réinitialisation du mot de passe : refus SMTP, statut {StatusCode}, catégorie {ErrorCode}.",
                    (int)smtpError.StatusCode, smtpError.ErrorCode);
            }

            // Autoriser une nouvelle tentative sans effacer un éventuel jeton plus récent.
            await _db.Users
                .Where(x => x.id == user.id && x.hashtokenreinitialisationpassword == tokenHash)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.hashtokenreinitialisationpassword, (string?)null)
                    .SetProperty(x => x.expirationtokenreinitialisationpassword, (DateTime?)null));
        }

        return Ok(new { message = confirmation });
    }

    // -----------------------------------
    // MODIFICATION DU MOT DE PASSE PAR LIEN EMAIL
    // -----------------------------------
    [AllowAnonymous]
    [HttpPost("reset-password")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        const string invalidLink = "Ce lien est invalide, expiré ou déjà utilisé. Veuillez demander un nouveau lien de réinitialisation.";

        if (dto == null || dto.token == null || dto.token.Length != 64 ||
            !dto.token.All(Uri.IsHexDigit))
            return BadRequest(new { message = invalidLink });

        if (string.IsNullOrWhiteSpace(dto.password) || dto.password.Length < 8)
            return BadRequest(new { message = "Le mot de passe doit contenir au moins 8 caractères." });

        // BCrypt ne prend en compte que les 72 premiers octets.
        if (Encoding.UTF8.GetByteCount(dto.password) > 72)
            return BadRequest(new { message = "Le mot de passe est trop long. Veuillez le raccourcir." });

        if (dto.password != dto.passwordConfirmation)
            return BadRequest(new { message = "Les deux mots de passe doivent être identiques." });

        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(dto.token)));
        var now = DateTime.UtcNow;
        var userId = await _db.Users.AsNoTracking()
            .Where(x => x.hashtokenreinitialisationpassword == tokenHash &&
                x.expirationtokenreinitialisationpassword > now)
            .Select(x => (int?)x.id)
            .FirstOrDefaultAsync(HttpContext.RequestAborted);

        if (userId is null)
            return BadRequest(new { message = invalidLink });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.password);
        bool updated;
        try
        {
            updated = await _sessionValidation.ResetPasswordAsync(
                userId.Value, tokenHash, passwordHash, HttpContext.RequestAborted);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError("Échec de réinitialisation du mot de passe pour le compte {UserId} ({ErrorType}).",
                userId.Value, ex.GetType().Name);
            return StatusCode(500, new { message = "Impossible de modifier le mot de passe. Veuillez réessayer." });
        }

        if (!updated)
            return BadRequest(new { message = invalidLink });

        return Ok(new { message = "Votre mot de passe a été modifié. Vous pouvez à présent vous connecter." });
    }

    // -----------------------------------
    // DISCONNECT
    // -----------------------------------
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var principal = HttpContext.Items[typeof(ISessionValidationService)] as ClaimsPrincipal ?? User;
            await _sessionValidation.RevokeCurrentAsync(principal, HttpContext.RequestAborted);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError("Échec de révocation de la session lors de la déconnexion ({ErrorType}).", ex.GetType().Name);
            return StatusCode(500, new { message = "La déconnexion a échoué. Veuillez réessayer." });
        }

        Response.Cookies.Delete("jwt", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax
        });

        return Ok(new { message = "Logged out" });
    }

    // -----------------------------------
    // PROTECTED ROUTE (ADMIN ONLY)
    // role = 10 => admin
    // -----------------------------------
    [Authorize]
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

        if (!int.TryParse(roleClaim, out int role))
            return Unauthorized();

        if (role < 10)
            return Forbid();

        var users = await _db.Users
            .Take(5)
            .Select(x => new
            {
                x.id,
                x.email,
                x.pseudo,
                x.statut,
                x.datecreation,
                x.accesblock,
                x.suspendu,
                x.grade,
                x.role
            })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            email = User.FindFirst(ClaimTypes.Email)?.Value,
            role = User.FindFirst(ClaimTypes.Role)?.Value,
            pseudo = User.FindFirst(ClaimTypes.Name)?.Value,
            statut = User.FindFirst("statut")?.Value,
            grade = User.FindFirst("grade")?.Value
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (dto == null)
            return BadRequest(new
            {
                message = "Données invalides."
            });

        var email = dto.email?.Trim().ToLowerInvariant();
        var pseudo = dto.pseudo?.Trim();

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(pseudo) ||
            string.IsNullOrWhiteSpace(dto.password))
        {
            return BadRequest(new
            {
                message = "Tous les champs sont obligatoires."
            });
        }

        // -----------------------------
        // EMAIL DÉJÀ UTILISÉ
        // -----------------------------
        var emailExists = await _db.Users
            .AnyAsync(x => x.email == email);

        if (emailExists)
        {
            return Conflict(new
            {
                field = "email",
                message = "Cette adresse email est déjà utilisée."
            });
        }

        // -----------------------------
        // PSEUDO DÉJÀ UTILISÉ
        // -----------------------------
        var pseudoExists = await _db.Users
            .AnyAsync(x => x.pseudo.ToLower() == pseudo.ToLower());

        if (pseudoExists)
        {
            return Conflict(new
            {
                field = "pseudo",
                message = "Ce pseudo est déjà utilisé."
            });
        }

        // -----------------------------
        // LONGUEUR PASSWORD
        // -----------------------------
        if (dto.password.Length < 8)
        {
            return BadRequest(new
            {
                field = "password",
                message = "Le mot de passe doit contenir au moins 8 caractères."
            });
        }

        // -----------------------------
        // TOKEN DE VALIDATION EMAIL
        // -----------------------------
        var verificationToken = Convert.ToHexString(
            RandomNumberGenerator.GetBytes(32)
        );

        var verificationTokenHash = Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(verificationToken)
            )
        );

        // -----------------------------
        // CRÉATION UTILISATEUR
        // -----------------------------
        var user = new User
        {
            email = email,
            pseudo = pseudo,

            password = BCrypt.Net.BCrypt.HashPassword(dto.password),

            statut = "Utilisateur",
            datecreation = DateTime.UtcNow,
            accesblock = false,
            suspendu = false,
            grade = "",
            role = 1,

            emailverifie = false,
            hashtokenvalidationemail = verificationTokenHash,
            expirationtokenvalidationemail = DateTime.UtcNow.AddHours(24)
        };

        _db.Users.Add(user);

        await _db.SaveChangesAsync();

        // -----------------------------
        // ENVOI EMAIL DE VALIDATION
        // -----------------------------
        var verificationUrl =
            $"https://alanalezca.fr/validation-email?token={verificationToken}";

        await _emailService.SendEmailVerificationAsync(
            user.email,
            user.pseudo,
            verificationUrl
        );

        return Ok(new
        {
            message = "Compte créé. Un email de validation vous a été envoyé."
        });
    }

    // -----------------------------------
    // VALIDATION EMAIL
    // -----------------------------------
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.token))
        {
            return BadRequest(new
            {
                message = "Token de validation invalide."
            });
        }

        // -----------------------------
        // HASH DU TOKEN REÇU
        // -----------------------------
        var tokenHash = Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(dto.token)
            )
        );

        // -----------------------------
        // RECHERCHE UTILISATEUR
        // -----------------------------
        var user = await _db.Users
            .FirstOrDefaultAsync(x =>
                x.hashtokenvalidationemail == tokenHash
            );

        if (user == null)
        {
            return BadRequest(new
            {
                message = "Ce lien de validation est invalide."
            });
        }

        // -----------------------------
        // TOKEN EXPIRÉ
        // -----------------------------
        if (user.expirationtokenvalidationemail == null ||
            user.expirationtokenvalidationemail < DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message = "Ce lien de validation a expiré."
            });
        }

        // -----------------------------
        // VALIDATION DU COMPTE
        // -----------------------------
        user.emailverifie = true;

        // Le token ne doit plus pouvoir être réutilisé
        user.hashtokenvalidationemail = null;
        user.expirationtokenvalidationemail = null;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Votre adresse email a été validée avec succès."
        });
    }

    private async Task<IActionResult> CreateAuthenticationAsync(User user, string message)
    {
        var key = _configuration["Jwt:Key"];

        if (string.IsNullOrEmpty(key))
            return StatusCode(500, "JWT key not configured");

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        );

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var sessionDurationHours = _configuration.GetValue<int>("Jwt:SessionDurationHours", 168);
        if (sessionDurationHours <= 0)
            return StatusCode(500, "JWT session duration must be positive");

        var createdAt = DateTime.UtcNow;
        var expiresAt = createdAt.AddHours(sessionDurationHours);
        var sessionToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

        var claims = new[]
        {
            new Claim("sid", sessionToken),
            new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
            new Claim(ClaimTypes.Email, user.email),
            new Claim(ClaimTypes.Role, user.role?.ToString() ?? ""),
            new Claim(ClaimTypes.Name, user.pseudo ?? ""),
            new Claim("statut", user.statut ?? ""),
            new Claim("grade", user.grade ?? "")
        };

        var tokenDescriptor = new JwtSecurityToken(
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var token = new JwtSecurityTokenHandler()
            .WriteToken(tokenDescriptor);

        // Store the session reference, not the JWT. Only issue the cookie after persistence.
        var session = new AppSession
        {
            UserId = user.id,
            Token = sessionToken,
            CreatedAt = createdAt,
            ExpiresAt = expiresAt,
            RevokedAt = null
        };
        try
        {
            await using var transaction = await _db.Database.BeginTransactionAsync(HttpContext.RequestAborted);

            // Serialize session creation with password reset on the user row. A login
            // that checked the old password before a reset must not create a valid session afterwards.
            var allowed = await _db.Database.SqlQueryRaw<int>(@"
                SELECT 1 AS ""Value""
                FROM tab_users
                WHERE ""id"" = {0} AND ""password"" = {1}
                    AND ""emailverifie"" = TRUE
                    AND ""accesblock"" IS NOT TRUE AND ""suspendu"" IS NOT TRUE
                FOR UPDATE
            ", user.id, user.password).ToListAsync(HttpContext.RequestAborted);

            if (allowed.Count == 0) return Unauthorized("Invalid credentials");

            _db.AppSessions.Add(session);
            await _db.SaveChangesAsync(HttpContext.RequestAborted);
            await transaction.CommitAsync(HttpContext.RequestAborted);
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException is Npgsql.PostgresException postgresError)
            {
                _logger.LogError("Impossible de créer la session pour le compte {UserId}. Code PostgreSQL {SqlState}, table {TableName}, contrainte {ConstraintName}.",
                    user.id, postgresError.SqlState, postgresError.TableName, postgresError.ConstraintName);
            }
            else
            {
                _logger.LogError("Impossible de créer la session pour le compte {UserId} ({ErrorType}, {CauseType}).",
                    user.id, ex.GetType().Name, ex.InnerException?.GetType().Name);
            }
            return StatusCode(500, new { message = "Impossible de créer la session. Veuillez réessayer." });
        }

        _logger.LogInformation("Session {SessionId} enregistrée pour le compte {UserId} dans la base {Database}.",
            session.Id, user.id, _db.Database.GetDbConnection().Database);

        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Expires = expiresAt
        });

        return Ok(new
        {
            message
        });
    }
}


