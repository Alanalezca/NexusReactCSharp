namespace NexusNet.Api.Dtos.Keyforge;

public class KeyforgeDraftDto
{
    public string ID { get; set; } = string.Empty;

    public string? PseudoJ1 { get; set; }
    public string? PseudoJ2 { get; set; }

    public string? FactionBanJ1 { get; set; }
    public string? FactionBanJ2 { get; set; }

    // Joueur 1

    public string? FactionPickAJ1 { get; set; }
    public string? LienImgAJ1 { get; set; }
    public string? LibelleFactionAJ1 { get; set; }
    public string? CouleurAJ1 { get; set; }

    public string? FactionPickBJ1 { get; set; }
    public string? LienImgBJ1 { get; set; }
    public string? LibelleFactionBJ1 { get; set; }
    public string? CouleurBJ1 { get; set; }

    public string? FactionPickCJ1 { get; set; }
    public string? LienImgCJ1 { get; set; }
    public string? LibelleFactionCJ1 { get; set; }
    public string? CouleurCJ1 { get; set; }

    // Joueur 2

    public string? FactionPickAJ2 { get; set; }
    public string? LienImgAJ2 { get; set; }
    public string? LibelleFactionAJ2 { get; set; }
    public string? CouleurAJ2 { get; set; }

    public string? FactionPickBJ2 { get; set; }
    public string? LienImgBJ2 { get; set; }
    public string? LibelleFactionBJ2 { get; set; }
    public string? CouleurBJ2 { get; set; }

    public string? FactionPickCJ2 { get; set; }
    public string? LienImgCJ2 { get; set; }
    public string? LibelleFactionCJ2 { get; set; }
    public string? CouleurCJ2 { get; set; }

    // Informations draft

    public bool? AvecAnomalies { get; set; }
    public int? Etat { get; set; }
    public string? Commentaire { get; set; }

    public DateTime? DateCreation { get; set; }
    public DateTime? DateDerModif { get; set; }

    public string? IDSet { get; set; }

    // LEFT JOIN sur l_keyforge_sets
    public string? SetID { get; set; }

    public string? Titre { get; set; }
    public string? Libelle { get; set; }
    public int? Numero { get; set; }

    // Etat draft cartes

    public int? DraftEnCoursPourJoueurAouB { get; set; }
    public string? DraftEnCoursSurFactionAouBouC { get; set; }

    public bool? DraftJ1Finished { get; set; }
    public bool? DraftJ2Finished { get; set; }
}