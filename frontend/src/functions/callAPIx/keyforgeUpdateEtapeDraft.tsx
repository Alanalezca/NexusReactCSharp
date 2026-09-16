const updateEtapeDraft = async (
    idCurrentDraft,
    numEtape,
    callApiFetch
) => {
    const newValEtape = numEtape + 1;

    return await callApiFetch(
        `/api/keyforge/draft/${encodeURIComponent(idCurrentDraft)}/etape`,
        "Erreur lors de la mise à jour de l'étape du draft KeyForge",
        undefined,
        {
            method: "POST",
            body: JSON.stringify({
                etape: newValEtape
            })
        }
    );
};

export default updateEtapeDraft;