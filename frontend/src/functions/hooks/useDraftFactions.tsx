import { useState } from 'react';
import useUpdateFactionsCurrentDraft from '../callAPIx/keyforgeUpdateFactionsSpecificDraft';

const draftStepsConfig = {
    1: { type: "Banned", player: "J2", cleSetter: "factionBanJ2" },
    2: { type: "Banned", player: "J1", cleSetter: "factionBanJ1" },

    3: {
        type: "Picked",
        player: "J2",
        slot: "A",
        cleSetter: "factionPickAJ2",
        cleSetterBisA: "lienImgAJ2",
        cleSetterBisB: "libelleFactionAJ2",
        cleSetterBisC: "couleurAJ2"
    },

    4: {
        type: "Picked",
        player: "J2",
        slot: "B",
        cleSetter: "factionPickBJ2",
        cleSetterBisA: "lienImgBJ2",
        cleSetterBisB: "libelleFactionBJ2",
        cleSetterBisC: "couleurBJ2"
    },

    5: {
        type: "Picked",
        player: "J2",
        slot: "C",
        cleSetter: "factionPickCJ2",
        cleSetterBisA: "lienImgCJ2",
        cleSetterBisB: "libelleFactionCJ2",
        cleSetterBisC: "couleurCJ2"
    },

    6: {
        type: "Picked",
        player: "J1",
        slot: "A",
        cleSetter: "factionPickAJ1",
        cleSetterBisA: "lienImgAJ1",
        cleSetterBisB: "libelleFactionAJ1",
        cleSetterBisC: "couleurAJ1"
    },

    7: {
        type: "Picked",
        player: "J1",
        slot: "B",
        cleSetter: "factionPickBJ1",
        cleSetterBisA: "lienImgBJ1",
        cleSetterBisB: "libelleFactionBJ1",
        cleSetterBisC: "couleurBJ1"
    },
};

export const useDraftFactions = ({
    etapeDraft,
    setEtapeDraft,
    currentDraftKeyforge,
    setCurrentDraftKeyforge,
    setError,
    factionsJA,
    factionsJB,
    setFactionsJA,
    setFactionsJB
}) => {

    const { updateFactionsCurrentDraft } = useUpdateFactionsCurrentDraft();

    const step = draftStepsConfig[etapeDraft];

    const factionSetters = {
        J1: setFactionsJA,
        J2: setFactionsJB
    };

    const [factionsPickBan, setFactionPickBan] = useState({
        factionBanJ1: "",
        factionPickAJ1: "",
        factionPickBJ1: "",
        factionPickCJ1: "",
        factionBanJ2: "",
        factionPickAJ2: "",
        factionPickBJ2: "",
        factionPickCJ2: ""
    });

    const handleClickOnPickBanFaction = async (id, img, name, color) => {

        if (etapeDraft < 8) {
            factionSetters[step.player](prev =>
                prev?.map(f =>
                    f.id === id
                        ? { ...f, [step.type]: !f[step.type] }
                        : f
                )
            );

            setFactionPickBan(prev => ({
                ...prev,
                ...(step.cleSetter && { [step.cleSetter]: id }),
                ...(step.cleSetterBisA && { [step.cleSetterBisA]: img }),
                ...(step.cleSetterBisB && { [step.cleSetterBisB]: name }),
                ...(step.cleSetterBisC && { [step.cleSetterBisC]: color })
            }));

            setEtapeDraft(prev => prev + 1);

        } else if (etapeDraft === 8) {

            const success = await processPicksBansFactions(
                id,
                img,
                name,
                color
            );

            if (success) {
                setEtapeDraft(prev => prev + 1);
            }
        }
    };

    const processPicksBansFactions = async (id, img, name, color) => {
        try {
            const data = {
                ...factionsPickBan,
                factionPickCJ1: id,
                lienImgCJ1: img,
                libelleFactionCJ1: name,
                couleurCJ1: color
            };

            const success = await updateFactionsCurrentDraft(
                currentDraftKeyforge[0].id,
                data.factionBanJ1,
                data.factionPickAJ1,
                data.factionPickBJ1,
                data.factionPickCJ1,
                data.factionBanJ2,
                data.factionPickAJ2,
                data.factionPickBJ2,
                data.factionPickCJ2
            );

            if (!success) {
                return false;
            }

            setFactionsJA(prev =>
                prev?.map(f =>
                    f.id === id
                        ? { ...f, Picked: !f.Picked }
                        : f
                )
            );

            setFactionPickBan(data);

            setCurrentDraftKeyforge(prev => [{
                ...prev[0],
                ...data,
                etat: 10
            }]);

            return true;

        } catch (e) {
            console.error(e);
            setError("Erreur lors de la mise à jour");
            return false;
        }
    };

    return {
        handleClickOnPickBanFaction,
        factionsJA,
        factionsJB,
        setFactionsJA,
        setFactionsJB
    };
};