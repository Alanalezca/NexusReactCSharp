const enregistrementPoolsVersBdd = async (
    payload,
    idDraft,
    callApiFetch
) => {

    const cartes = payload.map(carte => ({
        idCarte: carte.id,
        joueurAouB: carte.playerAorB
    }));

    return await callApiFetch(
        `/api/keyforge/draft/${encodeURIComponent(idDraft)}/pool`,
        "Erreur lors de l'enregistrement du pool de cartes KeyForge",
        undefined,
        {
            method: "POST",
            body: JSON.stringify(cartes)
        }
    );
};

export default enregistrementPoolsVersBdd;