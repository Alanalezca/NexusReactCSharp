using Microsoft.EntityFrameworkCore;
using NexusNet.Api.Data;

namespace NexusNet.Api.Repositories.Sessions;

public sealed record SessionAccountSnapshot(
    int UserId,
    DateTime ExpiresAt,
    DateTime? RevokedAt,
    bool EmailVerified,
    bool AccessBlocked,
    bool Suspended,
    string Email,
    string Pseudo,
    int? Role,
    string? Statut,
    string? Grade);

public interface ISessionValidationRepository
{
    Task<SessionAccountSnapshot?> GetAsync(string sessionToken, int userId, CancellationToken cancellationToken);
    Task<int> RevokeAsync(string sessionToken, int userId, DateTime revokedAt, CancellationToken cancellationToken);
    Task<bool> ResetPasswordAndRevokeSessionsAsync(int userId, string tokenHash, string passwordHash, DateTime now, CancellationToken cancellationToken);
}

public sealed class SessionValidationRepository(AppDbContext db) : ISessionValidationRepository
{
    public async Task<bool> ResetPasswordAndRevokeSessionsAsync(int userId, string tokenHash, string passwordHash, DateTime now, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        // The conditional update consumes the reset token once and locks the user row
        // until both the password change and session revocations have committed.
        var updated = await db.Users
            .Where(user => user.id == userId && user.hashtokenreinitialisationpassword == tokenHash &&
                user.expirationtokenreinitialisationpassword > now)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(user => user.password, passwordHash)
                .SetProperty(user => user.hashtokenreinitialisationpassword, (string?)null)
                .SetProperty(user => user.expirationtokenreinitialisationpassword, (DateTime?)null), cancellationToken);

        if (updated == 0) return false;

        await db.AppSessions
            .Where(session => session.UserId == userId && session.RevokedAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(session => session.RevokedAt, now), cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return true;
    }

    public Task<int> RevokeAsync(string sessionToken, int userId, DateTime revokedAt, CancellationToken cancellationToken)
    {
        return db.AppSessions
            .Where(session => session.Token == sessionToken && session.UserId == userId && session.RevokedAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(session => session.RevokedAt, revokedAt), cancellationToken);
    }

    public Task<SessionAccountSnapshot?> GetAsync(string sessionToken, int userId, CancellationToken cancellationToken)
    {
        return (
            from session in db.AppSessions.AsNoTracking()
            join user in db.Users.AsNoTracking() on session.UserId equals user.id
            where session.Token == sessionToken && session.UserId == userId
            select new SessionAccountSnapshot(
                user.id,
                session.ExpiresAt,
                session.RevokedAt,
                user.emailverifie,
                user.accesblock == true,
                user.suspendu == true,
                user.email,
                user.pseudo,
                user.role,
                user.statut,
                user.grade)
        ).SingleOrDefaultAsync(cancellationToken);
    }
}
