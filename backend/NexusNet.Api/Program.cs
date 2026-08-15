using NexusNet.Api.Data;
using NexusNet.Api.Repositories.Articles;
using NexusNet.Api.Services.Articles;
using NexusNet.Api.Repositories.Smashup;
using NexusNet.Api.Services.Smashup;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using NexusNet.Api.Repositories.DiceThrone;
using NexusNet.Api.Services.DiceThrone;
using NexusNet.Api.Repositories.Keyforge;
using NexusNet.Api.Services.Keyforge;

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
// DEPENDENCY INJECTION - SERVICES / REPOSITORIES
// -----------------------------------
builder.Services.AddScoped<IArticlesRepository, ArticlesRepository>();
builder.Services.AddScoped<IArticlesService, ArticlesService>();
builder.Services.AddScoped<ISmashupRepository, SmashupRepository>();
builder.Services.AddScoped<ISmashupService, SmashupService>();
builder.Services.AddScoped<IDiceThroneRepository, DiceThroneRepository>();
builder.Services.AddScoped<IDiceThroneService, DiceThroneService>();
builder.Services.AddScoped<IKeyforgeRepository, KeyforgeRepository>();
builder.Services.AddScoped<IKeyforgeService, KeyforgeService>();

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
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("jwt", out var token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            },

            OnChallenge = context =>
            {
                context.HandleResponse();

                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                return context.Response.WriteAsync("{\"error\":\"unauthorized\"}");
            },

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
// -----------------------------------
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("User", policy =>
        policy.RequireAuthenticatedUser());

    options.AddPolicy("Moderator", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User.FindFirst(ClaimTypes.Role)?.Value;

            return int.TryParse(roleValue, out var role)
                   && role >= 5;
        }));

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
// FICHIERS STATIQUES REACT
// -----------------------------------
app.UseDefaultFiles();
app.UseStaticFiles();

// -----------------------------------
// CORS
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
// -----------------------------------
app.MapFallbackToFile("index.html");

app.Run();
