export const hasCardsForFaction = (pool, faction, joueur) => {
    if (!pool) return false;

    return pool.some(
        card =>
            card.idFaction === faction &&
            card.joueurAouB == joueur
    );
};
