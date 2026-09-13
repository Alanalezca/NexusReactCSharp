import useApiFetch from "../../api/useApiFetch";

interface UpdateFactionsDraftDto {
    parID: string;
    parFactionBanJ1: string | null;
    parFactionBanJ2: string | null;
    parFactionPickAJ1: string | null;
    parFactionPickBJ1: string | null;
    parFactionPickCJ1: string | null;
    parFactionPickAJ2: string | null;
    parFactionPickBJ2: string | null;
    parFactionPickCJ2: string | null;
}

interface ApiMessageResponse {
    message: string;
}

const useUpdateFactionsCurrentDraft = () => {

    const { callApiFetch } = useApiFetch();

    const updateFactionsCurrentDraft = async (
        idDraft: string,
        factionBanJ1: string | null,
        factionPickAJ1: string | null,
        factionPickBJ1: string | null,
        factionPickCJ1: string | null,
        factionBanJ2: string | null,
        factionPickAJ2: string | null,
        factionPickBJ2: string | null,
        factionPickCJ2: string | null
    ): Promise<boolean> => {

        const dto: UpdateFactionsDraftDto = {
            parID: idDraft,
            parFactionBanJ1: factionBanJ1,
            parFactionBanJ2: factionBanJ2,
            parFactionPickAJ1: factionPickAJ1,
            parFactionPickBJ1: factionPickBJ1,
            parFactionPickCJ1: factionPickCJ1,
            parFactionPickAJ2: factionPickAJ2,
            parFactionPickBJ2: factionPickBJ2,
            parFactionPickCJ2: factionPickCJ2
        };

        const result = await callApiFetch<ApiMessageResponse>(
            '/api/keyforge/updateFactionsSpecificDraft',
            'Erreur mise à jour des factions (phase pick/ban draft KeyForge)',
            undefined,
            {
                method: "POST",
                body: JSON.stringify(dto)
            }
        );

        return result !== null;
    };

    return { updateFactionsCurrentDraft };
};

export default useUpdateFactionsCurrentDraft;