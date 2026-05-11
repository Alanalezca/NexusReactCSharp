using NexusNet.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------------
// Déclaration de l'usage des controllers 
// -----------------------------------
builder.Services.AddControllers();

// -----------------------------------
// Lorsqu'un controller call AddDbContext -> Création d'une connexion à PostgreSQL
// -----------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// -----------------------------------
// CORS : Autorisation du front react à call l'API
// -----------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// -----------------------------------
// JWT KEY
// -----------------------------------
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrEmpty(jwtKey))
    throw new Exception("JWT Key missing in configuration");

// -----------------------------------
// AUTHENTICATION : Déclare l'utilisation de JWT via cookie
// Go chercher le jwt comme token d'authentification/vérif de sa validité
// -----------------------------------
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            // 🔐 JWT depuis cookie
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("jwt", out var token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            },

            // ❌ 401 propre
            OnChallenge = context =>
            {
                context.HandleResponse();

                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                return context.Response.WriteAsync("{\"error\":\"unauthorized\"}");
            },

            // ❌ 403 propre
            OnForbidden = context =>
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";

                return context.Response.WriteAsync("{\"error\":\"forbidden\"}");
            }
        };
    });

// -----------------------------------
// AUTHORIZATION (POLICIES)
// Creation des niveaux de protection des routes 
// selon la valeur du role (on rend utilisable dans un controller le [Authorize(Policy = "xxx")])
// -----------------------------------
builder.Services.AddAuthorization(options =>
{
    // 👤 utilisateur connecté
    options.AddPolicy("User", policy =>
        policy.RequireAuthenticatedUser());

    // 🛠 Moderator (role >= 5)
    options.AddPolicy("Moderator", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User.FindFirst(ClaimTypes.Role)?.Value;

            return int.TryParse(roleValue, out var role)
                   && role >= 5;
        }));

    // 🔥 Admin (role >= 10)
    options.AddPolicy("Admin", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User.FindFirst(ClaimTypes.Role)?.Value;

            return int.TryParse(roleValue, out var role)
                   && role >= 10;
        }));
});

// -----------------------------------
// BUILD
// -----------------------------------
var app = builder.Build();

// -----------------------------------
// PIPELINE HTTP (IMPORTANT)
// Ordre dans lequel chaque requête passe lors d'un call react vers API
// Requête React
//→ CORS vérifie si localhost:5173 est autorisé
//→ Authentication lit le cookie jwt et valide le token
//→ Authorization vérifie les droits / policies
//→ Controller exécuté
// -----------------------------------
// -----------------------------------
// FICHIERS STATIQUES REACT
// -----------------------------------
app.UseDefaultFiles();
app.UseStaticFiles();

// -----------------------------------
// CORS
// Utile surtout en dev local quand React tourne sur localhost:5173
// En production, front et API auront le même domaine
// -----------------------------------
app.UseCors("AllowFrontend");

// -----------------------------------
// AUTH
// -----------------------------------
app.UseAuthentication();
app.UseAuthorization();

// -----------------------------------
// API CONTROLLERS
// -----------------------------------
app.MapControllers();

// -----------------------------------
// FALLBACK REACT ROUTER
// Si l'URL n'est pas une API, on renvoie index.html
// Exemple : /login, /articles, /draft/keyforge
// -----------------------------------
app.MapFallbackToFile("index.html");

app.Run();