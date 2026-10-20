export type KeyforgeDraftQuota = {
    count: number;
    limit: number;
    canCreate: boolean;
};

export const getDraftLimitMessage = (limit: number) =>
    `Vous avez atteint la limite de ${limit} drafts KeyForge.`;
