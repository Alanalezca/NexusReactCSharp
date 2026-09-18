const updateFocusSurFactionAouBouC = async (
    idCurrentDraft,
    indiceFactionAouBouC,
    callApiFetch
) => {
    return await callApiFetch(
        `/api/keyforge/draft/${encodeURIComponent(idCurrentDraft)}/focus-faction`,
        "Erreur lors de la mise à jour de la faction active KeyForge",
        undefined,
        {
            method: "POST",
            body: JSON.stringify({
                factionAouBouC: indiceFactionAouBouC
            })
        }
    );
};

export default updateFocusSurFactionAouBouC;