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

        if (string.IsNullOrEmpty(loginOrEmail) || string.IsNullOrEmpty(dto.password))
            return BadRequest("Invalid payload");

        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.email == loginOrEmail || x.pseudo == loginOrEmail);

        if (user == null)
            return Unauthorized("Invalid credentials");

        // BCrypt check
        bool isValidPassword = BCrypt.Net.BCrypt.Verify(dto.password, user.password);

        if (!isValidPassword)
            return Unauthorized("Invalid credentials");

        // JWT KEY
        var key = _configuration["Jwt:Key"];

        if (string.IsNullOrEmpty(key))
            return StatusCode(500, "JWT key not configured");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        // -----------------------------------
        // CLAIMS (role = int)
        // -----------------------------------
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

        var token = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

        // -----------------------------------
        // COOKIE JWT
        // -----------------------------------
        // Response.Cookies.Append("jwt", token, new CookieOptions
        // {
        //     HttpOnly = true,
        //     Secure = true, // true en prod HTTPS
        //     SameSite = SameSiteMode.None,
        //     Expires = DateTime.UtcNow.AddHours(2)
        // });

        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // 👈 OK en dev
            SameSite = SameSiteMode.Lax, // 🔥 CHANGEMENT ICI
            Expires = DateTime.UtcNow.AddHours(2)
        });

        return Ok(new
        {
            message = "Login successful"
        });
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

        var users = await _db.Users.Take(5).ToListAsync();

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
}
