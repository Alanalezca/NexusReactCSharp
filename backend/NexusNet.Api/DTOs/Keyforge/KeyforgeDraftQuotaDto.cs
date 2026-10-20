namespace NexusNet.Api.Dtos.Keyforge;

public class KeyforgeDraftQuotaDto
{
    public const int DefaultLimit = 10;

    public int Count { get; init; }
    public int Limit { get; init; } = DefaultLimit;
    public bool CanCreate => Count < Limit;
}

public enum CreateKeyforgeDraftResult
{
    Failed,
    Created,
    LimitReached
}
