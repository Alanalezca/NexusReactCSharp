using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NexusNet.Api.Data;
using NexusNet.Api.Repositories.Sitemap;
using NexusNet.Api.Repositories.Articles;
using NexusNet.Api.Repositories.DiceThrone;
using NexusNet.Api.Repositories.Keyforge;
using NexusNet.Api.Repositories.Smashup;
using NexusNet.Api.Services.Articles;
using NexusNet.Api.Services.DiceThrone;
using NexusNet.Api.Services.Keyforge;
using NexusNet.Api.Services.Smashup;
using Npgsql;
using System.Security.Claims;
using System.Text;


var builder = WebApplication.CreateBuilder(args);


// -----------------------------------
// CONTROLLERS
// -----------------------------------
builder.Services.AddControllers();


// -----------------------------------
// DATABASE
// -----------------------------------
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
{
    throw new Exception("DefaultConnection missing in configuration");
}


// -----------------------------------
// ENTITY FRAMEWORK / APPDBCONTEXT
// -----------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));


// -----------------------------------
// NPGSQL DATASOURCE
// Utilisé notamment par SitemapRepository
// -----------------------------------
builder.Services.AddSingleton(sp =>
{
    return NpgsqlDataSource.Create(connectionString);
});


// -----------------------------------
// DEPENDENCY INJECTION
// SERVICES / REPOSITORIES
// -----------------------------------

// Articles
builder.Services.AddScoped<IArticlesRepository, ArticlesRepository>();
builder.Services.AddScoped<IArticlesService, ArticlesService>();

// Smash Up
builder.Services.AddScoped<ISmashupRepository, SmashupRepository>();
builder.Services.AddScoped<ISmashupService, SmashupService>();

// Dice Throne
builder.Services.AddScoped<IDiceThroneRepository, DiceThroneRepository>();
builder.Services.AddScoped<IDiceThroneService, DiceThroneService>();

// KeyForge
builder.Services.AddScoped<IKeyforgeRepository, KeyforgeRepository>();
builder.Services.AddScoped<IKeyforgeService, KeyforgeService>();

// Sitemap
builder.Services.AddScoped<ISitemapRepository, SitemapRepository>();


// -----------------------------------
// CORS
// Autorisation du frontend React local
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
{
    throw new Exception("JWT Key missing in configuration");
}


// -----------------------------------
// AUTHENTICATION
// JWT stocké dans le cookie "jwt"
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

                return context.Response.WriteAsync(
                    "{\"error\":\"unauthorized\"}"
                );
            },

            OnForbidden = context =>
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";

                return context.Response.WriteAsync(
                    "{\"error\":\"forbidden\"}"
                );
            }
        };
    });


// -----------------------------------
// AUTHORIZATION
// -----------------------------------
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("User", policy =>
        policy.RequireAuthenticatedUser());

    options.AddPolicy("Moderator", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User
                .FindFirst(ClaimTypes.Role)?
                .Value;

            return int.TryParse(roleValue, out var role)
                   && role >= 5;
        }));

    options.AddPolicy("Admin", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User
                .FindFirst(ClaimTypes.Role)?
                .Value;

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
// AUTHENTICATION / AUTHORIZATION
// -----------------------------------
app.UseAuthentication();
app.UseAuthorization();


// -----------------------------------
// API CONTROLLERS
//
// Comprend notamment :
// GET /sitemap.xml
// -----------------------------------
app.MapControllers();


// -----------------------------------
// FALLBACK REACT ROUTER
//
// IMPORTANT : doit rester APRÈS
// app.MapControllers()
// -----------------------------------
app.MapFallbackToFile("index.html");


app.Run();