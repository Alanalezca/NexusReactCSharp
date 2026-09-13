namespace NexusNet.Api.Dtos.Keyforge;

public class UpdateKeyforgeFactionsDto
{
    public string ParID { get; set; } = string.Empty;

    public string? ParFactionBanJ1 { get; set; }
    public string? ParFactionBanJ2 { get; set; }

    public string? ParFactionPickAJ1 { get; set; }
    public string? ParFactionPickBJ1 { get; set; }
    public string? ParFactionPickCJ1 { get; set; }

    public string? ParFactionPickAJ2 { get; set; }
    public string? ParFactionPickBJ2 { get; set; }
    public string? ParFactionPickCJ2 { get; set; }
}