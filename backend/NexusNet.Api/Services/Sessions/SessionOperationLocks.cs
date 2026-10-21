namespace NexusNet.Api.Services.Sessions;

// A fixed number of process-wide locks avoids retaining a lock for every past session.
// All sessions of a user share a lock so a password reset can invalidate them together.
public sealed class SessionOperationLocks
{
    private readonly SemaphoreSlim[] locks = Enumerable.Range(0, 64)
        .Select(_ => new SemaphoreSlim(1, 1)).ToArray();

    public SemaphoreSlim Get(int userId) =>
        locks[(int)((uint)userId % (uint)locks.Length)];
}
