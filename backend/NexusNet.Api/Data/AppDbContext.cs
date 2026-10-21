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

        modelBuilder.Entity<AppSession>(entity =>
        {
            entity.ToTable("app_sessions");
            entity.HasKey(session => session.Id);

            entity.Property(session => session.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(session => session.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(session => session.Token)
                .HasColumnName("token")
                .IsRequired();

            entity.HasAlternateKey(session => session.Token)
                .HasName("token");

            entity.Property(session => session.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()")
                .IsRequired();

            entity.Property(session => session.ExpiresAt)
                .HasColumnName("expires_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.Property(session => session.RevokedAt)
                .HasColumnName("revoked_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired(false);
        });
    }
}
