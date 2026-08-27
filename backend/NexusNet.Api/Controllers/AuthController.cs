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

namespace NexusNet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
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

        if (dto.password.Length < 6)
        {
            return BadRequest(new
            {
                field = "password",
                message = "Le mot de passe doit contenir au moins 8 caractères."
            });
        }

        return CreateAuthentication(user, "Login successful");
    }

    // -----------------------------------
    // DISCONNECT
    // -----------------------------------
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt", new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // true en prod HTTPS
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

        return Ok(new
        {
            message = "Compte créé. Un email de validation vous a été envoyé."
        });
    }

    private IActionResult CreateAuthentication(User user, string message)
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

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
            new Claim(ClaimTypes.Email, user.email),
            new Claim(ClaimTypes.Role, user.role?.ToString() ?? ""),
            new Claim(ClaimTypes.Name, user.pseudo ?? ""),
            new Claim("statut", user.statut ?? ""),
            new Claim("grade", user.grade ?? "")
        };

        var tokenDescriptor = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        var token = new JwtSecurityTokenHandler()
            .WriteToken(tokenDescriptor);

        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddHours(2)
        });

        return Ok(new
        {
            message
        });
    }
}


