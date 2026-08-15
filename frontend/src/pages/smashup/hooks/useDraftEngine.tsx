import type { Dispatch, SetStateAction } from "react";

export type DraftStep = {
    phase: string;
    idDraftFromCurrentPlayer: number;
    indiceToLoad: string;
    etapeFinale: boolean;
    colorTxtCurrentPlayer: string;
    colorTxtCurrentInstructionColor: string;
    txtCurrentPlayer: string;
    txtInstruction: string;
    txtColor: string;
};

type SmashupFaction = {
    CodeFaction: string;
    CodeBox: string;
    Libelle: string;
    LienImg: string | null;
    Classement: number;
    AvecTitan: boolean;
    Pickable: boolean;
    Selected: boolean;
    TypeSelected: string | null;
};

type DraftPlayer = {
    ID: number;
    FactionBanA: string;
    FactionBanB: string;
    FactionPickA: string;
    FactionPickB: string;
};

type LastFactionRollback = {
    codeFaction: string | null;
    libelleFaction: string | null;
};

type DraftEngineProps = {
    currentEtapeDraft: number;
    setCurrentEtapeDraft: Dispatch<SetStateAction<number>>;

    currentDraftStep: DraftStep;

    nbJoueursSelected: number;

    setListeFactions: Dispatch<SetStateAction<SmashupFaction[]>>;

    setFactionsPickBanByPlayer: Dispatch<
        SetStateAction<DraftPlayer[]>
    >;

    configDraftSteps: Record<number, DraftStepsConfig>;

    lastFactionSaisieForRollback: LastFactionRollback;

    setLastFactionSaisieForRollback: Dispatch<
        SetStateAction<LastFactionRollback>
    >;

    setDraftTermine: Dispatch<SetStateAction<boolean>>;
};

type DraftConfig = {
    limiteEtape: number;
};

export type DraftStepsConfig = [
    DraftConfig,
    ...DraftStep[]
];

export function useDraftEngine({
    currentEtapeDraft,
    setCurrentEtapeDraft,
    currentDraftStep,
    nbJoueursSelected,
    setListeFactions,
    setFactionsPickBanByPlayer,
    configDraftSteps,
    lastFactionSaisieForRollback,
    setLastFactionSaisieForRollback,
    setDraftTermine
}: DraftEngineProps) {

    const selectFaction = (
        codeFaction: string,
        libelleFaction: string,
        selectedOrNot: boolean
    ) => {

        if (selectedOrNot) {
            return;
        }



        setListeFactions(prev =>
            prev.map(faction =>
                faction.CodeFaction === codeFaction
                    ? {
                        ...faction,
                        Selected: true,
                        TypeSelected: currentDraftStep.phase
                    }
                    : faction
            )
        );

        setLastFactionSaisieForRollback({
            codeFaction,
            libelleFaction
        });

        if (currentEtapeDraft <= configDraftSteps[nbJoueursSelected][0].limiteEtape) {

            setFactionsPickBanByPlayer(prev =>
                prev.map(player =>
                    player.ID === currentDraftStep.idDraftFromCurrentPlayer
                        ? {
                            ...player,
                            [currentDraftStep.indiceToLoad]: libelleFaction
                        }
                        : player
                )
            );

            if (currentDraftStep.etapeFinale) {
                setDraftTermine(true);
            }
        }

        setCurrentEtapeDraft(prev => prev + 1);
    };

    const rollback = () => {
        setCurrentEtapeDraft(prev => prev - 1);
        setFactionsPickBanByPlayer(prev => 
            prev?.map(prev =>
                prev.FactionBanA === lastFactionSaisieForRollback.libelleFaction
                ? {...prev, 
                    FactionBanA: "-"
                }
                : prev
            ));
        
        setFactionsPickBanByPlayer(prev => 
            prev?.map(prev =>
                prev.FactionBanB === lastFactionSaisieForRollback.libelleFaction
                ? {...prev, 
                    FactionBanB: "-"
                }
                : prev
            ));

                setFactionsPickBanByPlayer(prev => 
            prev?.map(prev =>
                prev.FactionPickA === lastFactionSaisieForRollback.libelleFaction
                ? {...prev, 
                    FactionPickA: "-"
                }
                : prev
            ));

        setFactionsPickBanByPlayer(prev => 
            prev?.map(prev =>
                prev.FactionPickB === lastFactionSaisieForRollback.libelleFaction
                ? {...prev, 
                    FactionPickB: "-"
                }
                : prev
        ));

        setListeFactions(prev =>
            prev?.map(prevFaction => 
                prevFaction.CodeFaction === lastFactionSaisieForRollback.codeFaction
                ? {...prevFaction,
                    Selected: false,
                    TypeSelected: null}
                : prevFaction
        ));


        setLastFactionSaisieForRollback({
            codeFaction: null,
            libelleFaction: null
        });
    }

    return {
        selectFaction,
        rollback
    };
}