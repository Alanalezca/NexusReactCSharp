using Microsoft.EntityFrameworkCore;
using NexusNet.Api.Models;

namespace NexusNet.Api.Data;

// -------------------------------
// Pont entre C# et PostgreSQL
// -------------------------------
public class AppDbContext : DbContext
{

    // -------------------------------
    // Reception des options de config. de Program.cs
    // -------------------------------
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // -------------------------------
    // Tables
    // -------------------------------
    public DbSet<User> Users { get; set; }
    public DbSet<AppSession> AppSessions { get; set; }

    // -------------------------------
    // Application des règles de mapping
    // -------------------------------
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // mapping table existante PostgreSQL
        modelBuilder.Entity<User>().ToTable("tab_users");

        // optionnel (recommandé)
        modelBuilder.Entity<AppSession>().ToTable("app_sessions");
    }
}