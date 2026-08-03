namespace NexusNet.Api.Dtos.Smashup;

public class SmashupBoxDto
{
    public string CodeBox { get; set; } = string.Empty;
    public string Libelle { get; set; } = string.Empty;
    public string? LienImg { get; set; }
    public int Classement { get; set; }
    public int NbFactions { get; set; }
}

public class SmashupFactionDto
{
    public string CodeFaction { get; set; } = string.Empty;
    public string CodeBox { get; set; } = string.Empty;
    public string Libelle { get; set; } = string.Empty;
    public string? LienImg { get; set; }
    public int Classement { get; set; }
    public bool AvecTitan { get; set; }
    public bool Pickable { get; set; }
}
