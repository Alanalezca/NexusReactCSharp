export interface KeyforgeDraft {
    ID: string;

    PseudoJ1: string | null;
    PseudoJ2: string | null;

    FactionBanJ1: string | null;
    FactionBanJ2: string | null;

    // Joueur 1

    FactionPickAJ1: string | null;
    LienImgAJ1: string | null;
    LibelleFactionAJ1: string | null;
    CouleurAJ1: string | null;

    FactionPickBJ1: string | null;
    LienImgBJ1: string | null;
    LibelleFactionBJ1: string | null;
    CouleurBJ1: string | null;

    FactionPickCJ1: string | null;
    LienImgCJ1: string | null;
    LibelleFactionCJ1: string | null;
    CouleurCJ1: string | null;

    // Joueur 2

    FactionPickAJ2: string | null;
    LienImgAJ2: string | null;
    LibelleFactionAJ2: string | null;
    CouleurAJ2: string | null;

    FactionPickBJ2: string | null;
    LienImgBJ2: string | null;
    LibelleFactionBJ2: string | null;
    CouleurBJ2: string | null;

    FactionPickCJ2: string | null;
    LienImgCJ2: string | null;
    LibelleFactionCJ2: string | null;
    CouleurCJ2: string | null;

    // Informations draft

    AvecAnomalies: boolean | null;
    Etat: number | null;
    Commentaire: string | null;

    DateCreation: string | null;
    DateDerModif: string | null;

    IDSet: string | null;

    SetID: string | null;

    Titre: string | null;
    Libelle: string | null;
    Numero: number | null;

    // Etat draft cartes

    DraftEnCoursPourJoueurAouB: number | null;
    DraftEnCoursSurFactionAouBouC: string | null;

    DraftJ1Finished: boolean | null;
    DraftJ2Finished: boolean | null;
}

export interface KeyforgeFaction {
    id: string;
    libelle: string;
    lienImg: string | null;
    couleurRGB: string | null;

    Picked?: boolean;
    Banned?: boolean;
}