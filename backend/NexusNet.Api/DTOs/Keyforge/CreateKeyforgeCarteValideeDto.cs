namespace NexusNet.Api.Dtos.Keyforge;

public class CreateKeyforgeCarteValideeDto
{
    public string IDCarte { get; set; } = string.Empty;

    public int JoueurAouB { get; set; }

    public int Classement { get; set; }

    public int ClassementCardToDeleteA { get; set; }

    public int ClassementCardToDeleteB { get; set; }

    public bool ReinitFocusFactionDuDraft { get; set; }

    public bool ReinitFocusJoueurDuDraft { get; set; }

    public bool DraftJ1Finished { get; set; }

    public bool DraftJ2Finished { get; set; }

    public int? Etape { get; set; }
}