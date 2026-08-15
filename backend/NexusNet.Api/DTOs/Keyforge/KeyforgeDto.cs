namespace NexusNet.Api.Dtos.Keyforge;

public class KeyforgeSetDto
{
    public string ID { get; set; } = string.Empty;
    public string? Annee { get; set; }
    public int? Numero { get; set; }
    public string? Libelle { get; set; }
}

public class KeyforgeFactionDto
{
    public string ID { get; set; } = string.Empty;
    public string? Libelle { get; set; }
    public string? LienImg { get; set; }
    public string? CouleurRGB { get; set; }
}

public class KeyforgeBaseCarteDto
{
    public string ID { get; set; } = string.Empty;
    public int? QteDispo { get; set; }
    public string? Faction { get; set; }
    public string? Ensemble { get; set; }
    public int? NbCartesDansEnsemble { get; set; }
}