const updateFocusSurJoueurAouB = async (
    idCurrentDraft,
    indiceJoueurAouB,
    callApiFetch
) => {

    return await callApiFetch(
        `/api/keyforge/draft/${encodeURIComponent(idCurrentDraft)}/focus-joueur`,
        "Erreur lors de la mise à jour du joueur actif KeyForge",
        undefined,
        {
            method: "POST",
            body: JSON.stringify({
                joueurAouB: indiceJoueurAouB
            })
        }
    );
};

export default updateFocusSurJoueurAouB;