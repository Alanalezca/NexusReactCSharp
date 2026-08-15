namespace NexusNet.Api.Dtos.Keyforge;

public class KeyforgeMyDraftDto
{
    public string ID { get; set; } = string.Empty;

    public string? PseudoJ1 { get; set; }
    public string? PseudoJ2 { get; set; }

    public string? FactionBanJ1 { get; set; }
    public string? FactionBanJ2 { get; set; }


    // Factions joueur 1

    public string? FactionPickAJ1 { get; set; }
    public string? FactionPickBJ1 { get; set; }
    public string? FactionPickCJ1 { get; set; }

    public string? LienImgFactionPickAJ1 { get; set; }
    public string? LienImgFactionPickBJ1 { get; set; }
    public string? LienImgFactionPickCJ1 { get; set; }


    // Factions joueur 2

    public string? FactionPickAJ2 { get; set; }
    public string? FactionPickBJ2 { get; set; }
    public string? FactionPickCJ2 { get; set; }

    public string? LienImgFactionPickAJ2 { get; set; }
    public string? LienImgFactionPickBJ2 { get; set; }
    public string? LienImgFactionPickCJ2 { get; set; }


    // Informations du draft

    public bool? AvecAnomalies { get; set; }
    public int? Etat { get; set; }
    public string? Commentaire { get; set; }

    public DateTime? DateCreation { get; set; }
    public DateTime? DateDerModif { get; set; }

    public string? IDSet { get; set; }
    public string? SetID { get; set; }

    public string? Titre { get; set; }
}