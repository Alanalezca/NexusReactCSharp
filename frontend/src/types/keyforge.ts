export interface KeyforgeDraft {
    id: string;

    pseudoJ1: string | null;
    pseudoJ2: string | null;

    factionBanJ1: string | null;
    factionBanJ2: string | null;

    // Joueur 1

    factionPickAJ1: string | null;
    lienImgAJ1: string | null;
    libelleFactionAJ1: string | null;
    couleurAJ1: string | null;

    factionPickBJ1: string | null;
    lienImgBJ1: string | null;
    libelleFactionBJ1: string | null;
    couleurBJ1: string | null;

    factionPickCJ1: string | null;
    lienImgCJ1: string | null;
    libelleFactionCJ1: string | null;
    couleurCJ1: string | null;

    // Joueur 2

    factionPickAJ2: string | null;
    lienImgAJ2: string | null;
    libelleFactionAJ2: string | null;
    couleurAJ2: string | null;

    factionPickBJ2: string | null;
    lienImgBJ2: string | null;
    libelleFactionBJ2: string | null;
    couleurBJ2: string | null;

    factionPickCJ2: string | null;
    lienImgCJ2: string | null;
    libelleFactionCJ2: string | null;
    couleurCJ2: string | null;

    // Informations draft

    avecAnomalies: boolean | null;
    etat: number | null;
    commentaire: string | null;

    dateCreation: string | null;
    dateDerModif: string | null;

    idSet: string | null;
    setID: string | null;

    titre: string | null;
    libelle: string | null;
    numero: number | null;

    // Etat draft cartes

    draftEnCoursPourJoueurAouB: number | null;
    draftEnCoursSurFactionAouBouC: string | null;

    draftJ1Finished: boolean | null;
    draftJ2Finished: boolean | null;
}

export interface KeyforgeFaction {
    id: string;
    libelle: string;
    lienImg: string | null;
    couleurRGB: string | null;

    Picked?: boolean;
    Banned?: boolean;
}

export interface KeyforgePoolCarte {
    idDraftSession: string;
    idCarte: string;

    joueurAouB: string | null;
    classement: number;

    libelleCarte: string | null;
    cheminImgCarte: string | null;

    numero: number | null;
    rarete: string | null;

    aombre: number | null;
    puissance: number | null;
    armure: number | null;

    libelleType: string | null;

    libelleFaction: string | null;
    lienImgFaction: string | null;
    idFaction: string;
}


export interface KeyforgeBaseCarte {
    id: string;
    qteDispo: number | null;
    faction: string | null;
    ensemble: string | null;
    nbCartesDansEnsemble: number | null;
}