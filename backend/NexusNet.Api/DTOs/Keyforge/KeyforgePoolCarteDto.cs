namespace NexusNet.Api.Dtos.Keyforge;

public class KeyforgePoolCarteDto
{
    public string IDDraftSession { get; set; } = string.Empty;
    public string IDCarte { get; set; } = string.Empty;

    public string? JoueurAouB { get; set; }
    public int Classement { get; set; }

    public string? LibelleCarte { get; set; }
    public string? CheminImgCarte { get; set; }

    public int? Numero { get; set; }
    public string? Rarete { get; set; }

    public int? Aombre { get; set; }
    public int? Puissance { get; set; }
    public int? Armure { get; set; }

    public string? LibelleType { get; set; }

    public string? LibelleFaction { get; set; }
    public string? LienImgFaction { get; set; }
    public string IDFaction { get; set; } = string.Empty;
}