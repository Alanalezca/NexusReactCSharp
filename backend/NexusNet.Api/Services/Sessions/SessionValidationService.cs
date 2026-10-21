using System.Globalization;
using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;
using NexusNet.Api.Repositories.Sessions;

namespace NexusNet.Api.Services.Sessions;

public interface ISessionValidationService
{
    Task<bool> ValidateAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default);
    Task RevokeCurrentAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default);
    Task<bool> ResetPasswordAsync(int userId, string tokenHash, string passwordHash, CancellationToken cancellationToken = default);
}

public sealed class SessionValidationService(
    ISessionValidationRepository repository,
    IMemoryCache cache,
    TimeProvider timeProvider,
    SessionOperationLocks operationLocks) : ISessionValidationService
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(60);
    private sealed record CachedSession(SessionAccountSnapshot Account, DateTimeOffset ValidUntil);

    public async Task<bool> ValidateAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default)
    {
        var sessionToken = principal.FindFirstValue("sid") ?? principal.FindFirstValue(ClaimTypes.Sid);
        if (principal.Identity is not ClaimsIdentity { IsAuthenticated: true } identity ||
            !int.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) || userId <= 0 ||
            sessionToken is not { Length: 64 } || !sessionToken.All(Uri.IsHexDigit))
        {
            return false;
        }

        var operationLock = operationLocks.Get(userId);
        await operationLock.WaitAsync(cancellationToken);
        try
        {
            return await ValidateSessionAsync(identity, sessionToken, userId, cancellationToken);
        }
        finally
        {
            operationLock.Release();
        }
    }

    public async Task RevokeCurrentAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default)
    {
        var sessionToken = principal.FindFirstValue("sid") ?? principal.FindFirstValue(ClaimTypes.Sid);
        if (principal.Identity?.IsAuthenticated != true ||
            !int.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) || userId <= 0 ||
            sessionToken is not { Length: 64 } || !sessionToken.All(Uri.IsHexDigit))
        {
            return;
        }

        var operationLock = operationLocks.Get(userId);
        await operationLock.WaitAsync(cancellationToken);
        try
        {
            // Do not clear the cache or report success if database persistence fails.
            await repository.RevokeAsync(sessionToken, userId, timeProvider.GetUtcNow().UtcDateTime, cancellationToken);
            if (cache.TryGetValue<Dictionary<string, CachedSession>>(CacheKey(userId), out var sessions))
                sessions!.Remove(sessionToken);
        }
        finally
        {
            operationLock.Release();
        }
    }

    public async Task<bool> ResetPasswordAsync(int userId, string tokenHash, string passwordHash, CancellationToken cancellationToken = default)
    {
        var operationLock = operationLocks.Get(userId);
        await operationLock.WaitAsync(cancellationToken);
        try
        {
            var updated = await repository.ResetPasswordAndRevokeSessionsAsync(
                userId, tokenHash, passwordHash, timeProvider.GetUtcNow().UtcDateTime, cancellationToken);
            if (updated) cache.Remove(CacheKey(userId));
            return updated;
        }
        finally
        {
            operationLock.Release();
        }
    }

    private static (string, int) CacheKey(int userId) => (nameof(SessionValidationService), userId);

    private async Task<bool> ValidateSessionAsync(ClaimsIdentity identity, string sessionToken, int userId, CancellationToken cancellationToken)
    {
        var cacheKey = CacheKey(userId);
        cache.TryGetValue<Dictionary<string, CachedSession>>(cacheKey, out var sessions);
        var now = timeProvider.GetUtcNow();
        SessionAccountSnapshot? account;

        if (sessions is not null && sessions.TryGetValue(sessionToken, out var cached) && cached.ValidUntil > now)
        {
            account = cached.Account;
        }
        else
        {
            account = await repository.GetAsync(sessionToken, userId, cancellationToken);
            // Count the lifetime from the start of the read, so a slow query cannot extend it.
            var validUntil = now.Add(CacheDuration);
            now = timeProvider.GetUtcNow();

            if (!IsValid(account, userId, now))
            {
                sessions?.Remove(sessionToken);
                return false;
            }

            var expiresAt = new DateTimeOffset(account!.ExpiresAt);
            if (expiresAt < validUntil) validUntil = expiresAt;
            if (validUntil > now)
            {
                sessions ??= new Dictionary<string, CachedSession>(StringComparer.Ordinal);
                foreach (var expiredKey in sessions.Where(entry => entry.Value.ValidUntil <= now).Select(entry => entry.Key).ToArray())
                    sessions.Remove(expiredKey);
                sessions[sessionToken] = new CachedSession(account, validUntil);
                cache.Set(cacheKey, sessions, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = CacheDuration
                });
            }
        }

        if (!IsValid(account, userId, now))
        {
            sessions?.Remove(sessionToken);
            return false;
        }

        // Authorization and /auth/me use the account state read from the database,
        // rather than the role and profile frozen in the JWT at login.
        ReplaceClaim(identity, ClaimTypes.Email, account!.Email);
        ReplaceClaim(identity, ClaimTypes.Name, account.Pseudo);
        ReplaceClaim(identity, ClaimTypes.Role, account.Role?.ToString(CultureInfo.InvariantCulture) ?? "");
        ReplaceClaim(identity, "statut", account.Statut ?? "");
        ReplaceClaim(identity, "grade", account.Grade ?? "");
        return true;
    }

    private static bool IsValid(SessionAccountSnapshot? account, int userId, DateTimeOffset now) =>
        account is not null && account.UserId == userId &&
        account.ExpiresAt > now.UtcDateTime && account.RevokedAt is null &&
        account.EmailVerified && !account.AccessBlocked && !account.Suspended;

    private static void ReplaceClaim(ClaimsIdentity identity, string type, string value)
    {
        foreach (var claim in identity.FindAll(type).ToArray()) identity.RemoveClaim(claim);
        identity.AddClaim(new Claim(type, value));
    }
}
