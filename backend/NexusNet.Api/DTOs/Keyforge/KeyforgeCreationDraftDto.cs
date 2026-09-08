namespace NexusNet.Api.Dtos.Keyforge;

public class CreateKeyforgeDraftDto
{
    public string ParID { get; set; } = string.Empty;
    public string ParJoueurA { get; set; } = string.Empty;
    public string ParJoueurB { get; set; } = string.Empty;
    public bool ParPresenceAnomalies { get; set; }
    public string ParSet { get; set; } = string.Empty;
    public DateTime ParDateCreation { get; set; }
    public DateTime ParDateMaj { get; set; }
    public string ParTitreDraft { get; set; } = string.Empty;
    public int ParEtat { get; set; }
}