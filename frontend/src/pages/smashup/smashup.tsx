import {useState, useRef, useEffect} from 'react';
import styles from './smashup.module.css';
import Loader from '../../components/others/Loader';
import Accordeon from '../../components/others/Accordeon';
import ButtonPiano from '../../components/others/ButtonPiano';
import InputStandard from '../../components/inputs/InputStandard';
import getRandomUniqueNumbers from '../../functions/getRandomUniqueNumbers';
import useApiFetch from "../../api/useApiFetch";
import { ThemeConsumer } from 'react-bootstrap/esm/ThemeProvider';

type SmashupBoxApi = {
    codeBox: string;
    libelle: string;
    lienImg: string | null;
    classement: number;
    nbFactions: number;
};

type SmashupFactionApi = {
    codeFaction: string;
    codeBox: string;
    libelle: string;
    lienImg: string | null;
    classement: number;
    avecTitan: boolean;
    pickable: boolean;
};

type SmashupBox = {
    CodeBox: string;
    Libelle: string;
    LienImg: string | null;
    Classement: number;
    NbFactions: number;
    Selected: boolean;
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

type SmashupLoadMode = "Normal" | "Random";

const Smashup = () => {
    const [isLoading, setIsLoading] = useState(true);
    const contenuPianoNbJoueurs = ['2 joueurs', '3 joueurs', '4 joueurs'];
    const [currentEtapeDraft, setCurrentEtapeDraft] = useState(0);
    const [nbJoueursSelected, setNbJoueursSelected] = useState(0);
    const inputsRef = useRef({});
    const [listeBoites, setListeBoite] = useState<SmashupBox[]>([]);
    const [listeFactions, setListeFactions] = useState<SmashupFaction[]>([]);
    const [compteurNbFactionsSelonBoitesSelected, setCompteurNbFactionsSelonBoitesSelected] = useState(0);
    const [namePlayers, setNamePlayers] = useState([
        { J1: "Joueur A", J2: "Joueur B", J3: "Joueur C", J4: "Joueur D" }
    ]);
    const [factionsPickBanByPlayer, setFactionsPickBanByPlayer] = useState([
        { ID: 1, FactionBanA: "-", FactionBanB: "-", FactionPickA: "-", FactionPickB: "-" },
        { ID: 2, FactionBanA: "-", FactionBanB: "-", FactionPickA: "-", FactionPickB: "-" },
        { ID: 3, FactionBanA: "-", FactionBanB: "-", FactionPickA: "-", FactionPickB: "-" },
        { ID: 4, FactionBanA: "-", FactionBanB: "-", FactionPickA: "-", FactionPickB: "-" }
    ]);
    const [showOverlayFactions, setShowOverlayFactions] = useState(false);
    const [txtCurrentInstruction, setTxtCurrentInstruction] = useState("XXX");
    const [txtCurrentInstructionColor, setTxtCurrentInstructionColor] = useState("XXX");
    const [txtCurrentPlayer, setTxtCurrentPlayer] = useState("XXX");
    const [txtCurrentPlayerColor, setTxtCurrentPlayerColor] = useState("XXX");
    const [phasePickOrBan, setPhasePickOrBan] = useState("");
    const [draftTermine, setDraftTermine] = useState(false);
    const [lastFactionSaisieForRollback, setLastFactionSaisieForRollback] = useState<{
        codeFaction: string | null;
        libelleFaction: string | null;
    }>({codeFaction: null, libelleFaction: null});
    const [modeSelectByDoubleClic, setModeSelectByDoubleClic] = useState(false);
    const [modeFactionsRandom, setModeFactionsRandom] = useState(false);
    const { callApiFetch } = useApiFetch();

    const [drivenDraftSteps, setDrivenDraftSteps] = useState({});

    useEffect(() => {
        if (nbJoueursSelected === 0) {
            if ([2, 3, 6, 7].includes(currentEtapeDraft)) {
                setPhasePickOrBan("Ban");
            } else {
                setPhasePickOrBan("Pick");
            }
        } else if (nbJoueursSelected === 1) {
            if ([2, 3, 4, 8, 9, 10].includes(currentEtapeDraft)) {
                setPhasePickOrBan("Ban");
            } else {
                setPhasePickOrBan("Pick");
            }
        } else if (nbJoueursSelected === 2) {
            if ([2, 3, 4, 5, 10, 11, 12, 13].includes(currentEtapeDraft)) {
                setPhasePickOrBan("Ban");
            } else {
                setPhasePickOrBan("Pick");
            }
        }
    }, [currentEtapeDraft])

    useEffect(() => {
        setIsLoading(true);
        const callGetBoxesSmashup = async () => {
            const data = await callApiFetch<SmashupBoxApi[]>(
            "/api/smashup/boites",
            "Erreur lors du chargement des boites de smashup",
            setIsLoading
            );

            if (data) {
                setListeBoite(data.map(boite => ({
                    CodeBox: boite.codeBox,
                    Libelle: boite.libelle,
                    LienImg: boite.lienImg,
                    Classement: boite.classement,
                    NbFactions: boite.nbFactions,
                    Selected: false,
                })));
            }
        };

        callGetBoxesSmashup();
    }, [])

    useEffect(() => {
        let nbFactions = 0;
        listeBoites.forEach((currentBoite) => {
            currentBoite.Selected && (nbFactions += currentBoite.NbFactions);
        });
        setCompteurNbFactionsSelonBoitesSelected(isNaN(nbFactions) ? 0 : nbFactions);
    }, [listeBoites])

    const handleBuildFiltreFactions = (boxes: SmashupBox[], modeNormalOrRandom: SmashupLoadMode) => {
        let filtreFactions = "";
        boxes.forEach((currentBox) => {
            currentBox?.Selected && (filtreFactions += (filtreFactions !== "" ? "$" : "") + currentBox?.CodeBox);
        });
        getFactionsFromBoxesSelected(filtreFactions, modeNormalOrRandom);
    };

    const getFactionsFromBoxesSelected = (filtre: string, modeNormalOrRandom: SmashupLoadMode) => {
        const callGetFactionsSmashupSelonBoxSelected = async () => {
            const data = await callApiFetch<SmashupFactionApi[]>(
            "/api/smashup/factions?filtreBoxes=" + encodeURIComponent(filtre),
            "Erreur lors du chargement des factions de smashup",
            setIsLoading
            );

            if (data) {
                const factions: SmashupFaction[] = data.map(faction => ({
                    CodeFaction: faction.codeFaction,
                    CodeBox: faction.codeBox,
                    Libelle: faction.libelle,
                    LienImg: faction.lienImg,
                    Classement: faction.classement,
                    AvecTitan: faction.avecTitan,
                    Pickable: faction.pickable,
                    Selected: false,
                    TypeSelected: null,
                }));

                modeNormalOrRandom === "Normal"
                    ? setListeFactions(factions)
                    : randomisationFactions(factions, 2);
            }
        };

        callGetFactionsSmashupSelonBoxSelected();
    };

    const randomisationFactions = (data: SmashupFaction[], nbPlayers: number) => {
        let nbFactionsPickable = data.length;
        const indiceFactionsGoPickableOff = getRandomUniqueNumbers(nbFactionsPickable - ((nbPlayers*4) +4), nbFactionsPickable -1);
        const newData = data.map((currentFaction, index) => 
        indiceFactionsGoPickableOff.includes(index) 
            ?   {...currentFaction, Pickable: false}
            : currentFaction
        );
        setModeFactionsRandom(true);
        setListeFactions(newData);
    };

    const handleClickOnBox = (codeBoite: string) => {
        setListeBoite(prevListeBoites => 
            prevListeBoites?.map(prevBoite =>
                prevBoite.CodeBox === codeBoite
                ? {...prevBoite, 
                    Selected: !prevBoite?.Selected}
                : prevBoite
            ))
    };

    const handleClickOnFaction = (codeFaction: string, libelleFaction: string, selectedOrNot: boolean) => {
        if (selectedOrNot) {
            return;
        }
        setListeFactions(prevListeFactions => 
            prevListeFactions?.map(prevFaction =>
                prevFaction.CodeFaction === codeFaction
                ? {...prevFaction, 
                    Selected: true,
                    TypeSelected: phasePickOrBan}
                : prevFaction
            ));
        setLastFactionSaisieForRollback(prev => 
            ({...prev,
                codeFaction: codeFaction,
                libelleFaction: libelleFaction
            })
        );
        
        
        if(currentEtapeDraft <= drivenDraftSteps[nbJoueursSelected][0].limiteEtape)
        {
            setTxtCurrentInstructionColor(drivenDraftSteps[nbJoueursSelected][currentEtapeDraft-1].txtColor);
            setFactionsPickBanByPlayer(prevFactionsPickBanByPlayer => 
                prevFactionsPickBanByPlayer?.map(draftFromCurrentPlayer =>
                draftFromCurrentPlayer.ID === drivenDraftSteps[nbJoueursSelected][currentEtapeDraft-1].idDraftFromCurrentPlayer
                ? {...draftFromCurrentPlayer, 
                    [drivenDraftSteps[nbJoueursSelected][currentEtapeDraft-1].indiceToLoad]: libelleFaction}
                : draftFromCurrentPlayer
            ));
            drivenDraftSteps[nbJoueursSelected][currentEtapeDraft-1].etapeFinale && setDraftTermine(true);
        }

        setCurrentEtapeDraft(prev => prev + 1);
    };

    const handleClickOnRollback = () => {
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


        setLastFactionSaisieForRollback(prev =>
            ({ 
                ...prev,
                codeFaction: null,
                libelleFaction: null
            })
        );
    }

    const handleLoadNamePlayers = () => {
        setNamePlayers((prev) =>({
            ...prev,
            J1: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A",
            J2: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B",
            J3: inputsRef?.current["pseudoPlayerC"]?.value || "Joueur C",
            J4: inputsRef?.current["pseudoPlayerD"]?.value || "Joueur D"
        }));
    };

    useEffect(() => {
        handleLoadTxtCurrentInstruction();
        handleLoadTxtPlayer();
        handleLoadColorPlayer();
        handleLoadColorInstruction();
    }, [currentEtapeDraft])


    const handleLoadTxtCurrentInstruction = () => {
        if(currentEtapeDraft > 0)
        {
            if(currentEtapeDraft <= drivenDraftSteps[nbJoueursSelected][0].limiteEtape)
            {
                setTxtCurrentInstruction(drivenDraftSteps[nbJoueursSelected][currentEtapeDraft-1].txtInstruction);
            }
        }
    };

    const handleLoadTxtPlayer = () => {
        if(currentEtapeDraft > 0)
        {
            if(currentEtapeDraft <= drivenDraftSteps[nbJoueursSelected][0].limiteEtape)
            {
                setTxtCurrentPlayer(drivenDraftSteps[nbJoueursSelected][currentEtapeDraft-1].txtCurrentPlayer);
            }
        }
    };

    const handleLoadColorPlayer = () => {
        if(currentEtapeDraft > 0)
        {
            if(currentEtapeDraft <= drivenDraftSteps[nbJoueursSelected][0].limiteEtape)
            {
                setTxtCurrentPlayerColor(drivenDraftSteps[nbJoueursSelected][currentEtapeDraft-1].colorTxtCurrentPlayer);
            }
        }
    };

    const handleLoadColorInstruction = () => {
        if(currentEtapeDraft > 0)
        {
            if(currentEtapeDraft <= drivenDraftSteps[nbJoueursSelected][0].limiteEtape)
            {
                setTxtCurrentInstructionColor(drivenDraftSteps[nbJoueursSelected][currentEtapeDraft-1].colorTxtCurrentInstructionColor);
            }
        }
    };

    const initArayForDataDriven = () => {
        const drivenDraftStep2players = [
            { limiteEtape: 9},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionBanA", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionBanA", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionPickA", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionPickA", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionBanB", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionBanB", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionPickB", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionPickB", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: true}
        ];

        const drivenDraftStep3players = [
            { limiteEtape: 13},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionBanA", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionBanA", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 3, indiceToLoad: "FactionBanA", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerC"]?.value || "Joueur C", colorTxtCurrentPlayer: "txtColorPlayerYellow", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionPickA", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionPickA", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 3, indiceToLoad: "FactionPickA", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerC"]?.value || "Joueur C", colorTxtCurrentPlayer: "txtColorPlayerYellow", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 3, indiceToLoad: "FactionBanB", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerC"]?.value || "Joueur C", colorTxtCurrentPlayer: "txtColorPlayerYellow", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionBanB", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionBanB", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 3, indiceToLoad: "FactionPickB", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerC"]?.value || "Joueur C", colorTxtCurrentPlayer: "txtColorPlayerYellow", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionPickB", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionPickB", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: true}
        ];


        const drivenDraftStep4players = [
            { limiteEtape: 17},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionBanA", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionBanA", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 3, indiceToLoad: "FactionBanA", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerC"]?.value || "Joueur C", colorTxtCurrentPlayer: "txtColorPlayerYellow", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 4, indiceToLoad: "FactionBanA", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerD"]?.value || "Joueur D", colorTxtCurrentPlayer: "txtColorPlayerGreen", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionPickA", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionPickA", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 3, indiceToLoad: "FactionPickA", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerC"]?.value || "Joueur C", colorTxtCurrentPlayer: "txtColorPlayerYellow", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 4, indiceToLoad: "FactionPickA", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerD"]?.value || "Joueur D", colorTxtCurrentPlayer: "txtColorPlayerGreen", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 4, indiceToLoad: "FactionBanB", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerD"]?.value || "Joueur D", colorTxtCurrentPlayer: "txtColorPlayerGreen", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 3, indiceToLoad: "FactionBanB", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerC"]?.value || "Joueur C", colorTxtCurrentPlayer: "txtColorPlayerYellow", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionBanB", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteRed", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionBanB", txtInstruction: "doit BANNIR une faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteRed", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 4, indiceToLoad: "FactionPickB", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerD"]?.value || "Joueur D", colorTxtCurrentPlayer: "txtColorPlayerGreen", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 3, indiceToLoad: "FactionPickB", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerC"]?.value || "Joueur C", colorTxtCurrentPlayer: "txtColorPlayerYellow", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 2, indiceToLoad: "FactionPickB", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerB"]?.value || "Joueur B", colorTxtCurrentPlayer: "txtColorPlayerBlue", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: false},
            { txtColor: "txtClignoteGreen", idDraftFromCurrentPlayer: 1, indiceToLoad: "FactionPickB", txtInstruction: "doit SELECTIONNER sa première faction", txtCurrentPlayer: inputsRef?.current["pseudoPlayerA"]?.value || "Joueur A", colorTxtCurrentPlayer: "txtColorPlayerRed", colorTxtCurrentInstructionColor: "txtClignoteGreen", etapeFinale: true}
        ];

        setDrivenDraftSteps({
            0: drivenDraftStep2players,
            1: drivenDraftStep3players,
            2: drivenDraftStep4players
        })
    }

    return (
        <>
            <div className="container-xl mt-3">
                <div className="row mb-4">
                    <div className="col-12">
                        <h2 className="mt-4 text-center txtColorWhite">Smash Up : Module de draft</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-lg-8 offset-lg-2 d-flex justify-content-center ">
                        <img src="\images\smashup\banniere.png" className="img-fluid rounded-2" alt="..."></img>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 mt-5">   
                        <Accordeon blocSoloOrTopOrMidOrBot="Solo" textTitre="Un module de draft pour Smash Up ?" textMain={`Ce module permet de réaliser un draft de type <b>"Snake Draft avec bans/picks"</b> pour le jeu <b>Smash Up</b>.<br /><br />
                            Voici le déroulement :<br />
                            1. Choisissez <b>le nombre de joueurs</b> participant à la partie.<br />
                            2. Sélectionnez <b>les boîtes de jeu</b> qui seront utilisées.<br />
                            - "<b>Valider la sélection</b>" -> Fait ressortir la totalité des factions contenues dans les boites sélectionnées.<br />
                            - "<b>Valider et randomiser</b>" -> Ne fait ressortir que (nombre de joueurs x4) +4 factions choisies au hasard parmis les factions contenues dans les boites sélectionnées.
                            3. La liste des <b>factions</b> correspondant aux boîtes choisies sera alors proposée.<br />
                            4. Chaque joueur procédera ensuite à la <b>phase de pick/ban</b> dans l’ordre indiqué.<br />
                            5. Prêt à <b>jouer</b> !`}/>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 mt-3 d-flex justify-content-center">
                            <h6 className="mt-4 text-center txtColorWhite">Nombre de joueurs</h6>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 mt-2 d-flex justify-content-center">
                            <ButtonPiano arrayLibelleOccurences={contenuPianoNbJoueurs} currentOccurenceInFocus={nbJoueursSelected} setterCurrentOccurenceInFocus={currentEtapeDraft === 0 ? setNbJoueursSelected : undefined}/>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 mt-3 d-flex justify-content-center">
                            <h6 className="mt-4 text-center txtColorWhite">Pseudos</h6>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 col-lg-6 offset-lg-3 mt-2 d-flex justify-content-center">
                        <InputStandard strType={"text"} strColor={"var(--txtColorPlayerRed)"} intMaxLength={50} strPlaceholder={"Joueur A"} strValeurByDef={""} strID={"pseudoJoueurA"} strTxtAlign="center" disabled={currentEtapeDraft > 0 && true} ref={(e) => (inputsRef.current["pseudoPlayerA"] = e)}/>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 col-lg-6 offset-lg-3 mt-2 d-flex justify-content-center">
                        <InputStandard strType={"text"} strColor={"var(--txtColorPlayerBlue)"} intMaxLength={50} strPlaceholder={"Joueur B"} strValeurByDef={""} strID={"pseudoJoueurB"} strTxtAlign="center" disabled={currentEtapeDraft > 0 && true} ref={(e) => (inputsRef.current["pseudoPlayerB"] = e)}/>
                    </div>
                </div>
                {nbJoueursSelected > 0 &&
                    <div className="row">             
                        <div className="col-12 col-lg-6 offset-lg-3 mt-2 d-flex justify-content-center">
                            <InputStandard strType={"text"} strColor={"var(--txtColorPlayerYellow)"} intMaxLength={50} strPlaceholder={"Joueur C"} strValeurByDef={""} strID={"pseudoJoueurC"} strTxtAlign="center" disabled={currentEtapeDraft > 0 && true} ref={(e) => (inputsRef.current["pseudoPlayerC"] = e)}/>
                        </div>
                    </div>
                }
                {nbJoueursSelected > 1 &&
                    <div className="row">             
                        <div className="col-12 col-lg-6 offset-lg-3 mt-2 d-flex justify-content-center">
                            <InputStandard strType={"text"} strColor={"var(--txtColorPlayerGreen)"} intMaxLength={50} strPlaceholder={"Joueur D"} strValeurByDef={""} strID={"pseudoJoueurD"} strTxtAlign="center" disabled={currentEtapeDraft > 0 && true} ref={(e) => (inputsRef.current["pseudoPlayerD"] = e)}/>
                        </div>
                    </div>
                }
                {currentEtapeDraft == 0 &&
                <div className="row">             
                    <div className="col-12 mt-5 mb-5 d-flex justify-content-center">
                        <button type="button" className={`btn btn-primary btn-ColorA`} onClick={() => {setCurrentEtapeDraft(1); initArayForDataDriven();}}>Valider le nombre de joueurs</button>
                    </div>
                </div>
                }

                {currentEtapeDraft == 1 &&
                <>
                    <div className="row">             
                        <div className="col-12 mt-1 justify-content-center">
                                <h6 className="mt-5 text-center txtColorWhite">Sélectionnez les boites à utiliser pour le draft</h6>
                        </div>
                    </div>
                    <div className="row">
                            <div className="col-12 mt-2 d-flex justify-content-center">
                                    <i className={`bx bx-check ${modeSelectByDoubleClic ? "bxInactiveToActive" : "bxActive"}`} onClick={() => modeSelectByDoubleClic && setModeSelectByDoubleClic(false)}></i>
                                    <i className={`bx bx-check-double ${modeSelectByDoubleClic ? "bxActive" : "bxInactiveToActive"} ms-3`} onClick={() => !modeSelectByDoubleClic && setModeSelectByDoubleClic(true)}></i>
                            </div>
                    </div>
                    <div className="row">             
                        <div className="col-12 mt-1 justify-content-center">
                                <h6 className="text-center txtColorDarkBisLight">{modeSelectByDoubleClic ? "(sélection par double clic)" : <>&nbsp;</>}</h6>
                                <h5 className={`mt-2 mb-4 text-center ${compteurNbFactionsSelonBoitesSelected >= ((parseInt(nbJoueursSelected) +2) *4 +4) ? "txtColorSuccessLight" : "txtColorDangerLight"}`}>{compteurNbFactionsSelonBoitesSelected} factions sélectionnées (sur {(parseInt(nbJoueursSelected) +2) *4 +4} minimum)</h5>
                        </div>
                    </div>
                    <div className="row">             
                        <div className="col-12 mt-3 d-flex flex-wrap justify-content-center">
                            {listeBoites?.map((currentBoite, index) => (
                                <div key={index} className={`${styles.conteneurImgX5} me-3 mb-3`}>
                                    <img src={currentBoite.LienImg} className={`rounded float-start ${styles.responsiveImgListeX5} ${currentBoite?.Selected && styles.conteneurImgSelected}`} onDoubleClick={() => modeSelectByDoubleClic && handleClickOnBox(currentBoite?.CodeBox)} onClick={() => !modeSelectByDoubleClic && handleClickOnBox(currentBoite?.CodeBox)} alt="..."></img>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="row mb-5">           
                        <div className="col-12 mt-4 d-flex justify-content-center">
                            <button type="button" disabled={compteurNbFactionsSelonBoitesSelected < ((parseInt(nbJoueursSelected) +2) *4 +4)} className={`btn btn-primary ${compteurNbFactionsSelonBoitesSelected >= ((parseInt(nbJoueursSelected) +2) *4 +4) ? "btn-ColorA" : "btn-ColorInactif"}`} onClick={() => {handleBuildFiltreFactions(listeBoites, "Normal"); setCurrentEtapeDraft(2); handleLoadNamePlayers();}}>Valider la sélection</button>
                        </div>
                        <div className="col-12 mt-3 mb-5 d-flex justify-content-center">
                            <button type="button" disabled={compteurNbFactionsSelonBoitesSelected < ((parseInt(nbJoueursSelected) +2) *4 +5)} className={`btn btn-primary ${compteurNbFactionsSelonBoitesSelected > ((parseInt(nbJoueursSelected) +2) *4 +4) ? "btn-ColorA" : "btn-ColorInactif"}`} onClick={() => {handleBuildFiltreFactions(listeBoites, "Random"); setCurrentEtapeDraft(2); handleLoadNamePlayers();}}>Valider et randomiser</button>
                        </div>
                    </div>
                </>
                }

                {currentEtapeDraft >= 2 && 

                <>
                    <div className="row">             
                        <div className="col-12 mt-3 d-flex justify-content-center">
                                <h6 className="mt-4 text-center txtColorWhite">Le draft porte sur les sets suivants :</h6>
                        </div>
                    </div>
                    {modeFactionsRandom && 
                        <div className="row">
                            <div className="col-12 mt-2 d-flex justify-content-center">
                                <h6 className="text-center txtColorDarkBisLight">(Factions randomisées)</h6>
                             </div>
                        </div>
                    }
                    <div className="row">             
                        <div className="col-12 col-lg-6 offset-lg-3 mt-2 d-flex justify-content-center">
                            <ul className="list-group">
                                {listeBoites?.map((currentBoite, index) => (
                                    currentBoite.Selected == true &&
                                        <li key={"boxResume-" + index} className="list-group-item static">{currentBoite.Libelle}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {!draftTermine && 
                    <>
                        <div className="row">
                            <div className="col-12 mt-3 d-flex justify-content-center">
                                    <i className={`bx bx-check ${modeSelectByDoubleClic ? "bxInactiveToActive" : "bxActive"}`} onClick={() => modeSelectByDoubleClic && setModeSelectByDoubleClic(false)}></i>
                                    <i className={`bx bx-check-double ${modeSelectByDoubleClic ? "bxActive" : "bxInactiveToActive"} ms-3`} onClick={() => !modeSelectByDoubleClic && setModeSelectByDoubleClic(true)}></i>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 d-flex justify-content-center">
                                        {!draftTermine &&
                                            <h6 className="text-center txtColorDarkBisLight">{modeSelectByDoubleClic ? "(sélection par double clic)" : <>&nbsp;</>}</h6>
                                        }
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 d-flex justify-content-center">
                                    {showOverlayFactions ? 
                                        <i className={`bx bx-image-alt bxNormalOrange`} onClick={() => setShowOverlayFactions(false)}></i> :
                                        <i className={`bx bx-detail bxNormalOrange`} onClick={() => setShowOverlayFactions(true)}></i>
                                    }
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 mt-3 d-flex justify-content-center">
                                    {draftTermine &&
                                        <h5 className={`text-center txtColorWhite`}>Le draft est à présent terminé !</h5>
                                    }
                            </div>          
                        </div>
                        <div className="row">        
                            <div className="col-12 mt-4 d-flex flex-wrap justify-content-center">
                                {listeFactions?.map((currentFaction, index) => (
                                    currentFaction?.Pickable == true && 
                                        <div key={"faction-" + index} className={`${styles.conteneurImgX5} ${phasePickOrBan == "Pick" && styles.toPick} ${phasePickOrBan == "Ban" && styles.toBan} ${currentFaction.TypeSelected == "Pick" ? styles.factionPicked : (currentFaction.TypeSelected == "Ban" ? styles.factionBanned : "")} me-3 mb-3`}>
                                            <div className={`${styles.blocFaction} ${currentFaction?.Selected && styles.grayscale}`}>
                                                <img src={currentFaction.LienImg} className={`rounded float-start ${styles.responsiveImgFaction}`} onClick={() => !modeSelectByDoubleClic && handleClickOnFaction(currentFaction?.CodeFaction, currentFaction?.Libelle, currentFaction?.Selected)} onDoubleClick={() => modeSelectByDoubleClic && handleClickOnFaction(currentFaction?.CodeFaction, currentFaction?.Libelle, currentFaction?.Selected)} alt="..."></img>
                                            </div>
                                            <div className={`${styles.overlayText} ${showOverlayFactions && styles.show}`} onClick={() => !modeSelectByDoubleClic && handleClickOnFaction(currentFaction?.CodeFaction, currentFaction?.Libelle, currentFaction?.Selected)} onDoubleClick={() => handleClickOnFaction(currentFaction?.CodeFaction, currentFaction?.Libelle, currentFaction?.Selected)}>
                                                {currentFaction.Libelle}
                                            </div>
                                        </div>
                                ))}
                            </div>
                        </div>
                    </>
                    }

                    <div className="row">             
                        <div className="col-12 mt-3 mb-3 d-flex justify-content-center">
                                <h4 className="text-center txtColorWhite">Résultat du draft</h4>
                        </div>
                    </div>

                    <div className="row mb-5">             
                        <div className="col-12 col-lg-6 mt-2 mb-3 d-flex justify-content-center">
                            <ul className="list-group w-100 text-center">
                                <li className="list-group-item staticHeaderTxtPlayerRed">{namePlayers.J1}</li>
                                <li className="list-group-item staticRed">{factionsPickBanByPlayer[0].FactionBanA}</li>
                                <li className="list-group-item staticRed">{factionsPickBanByPlayer[0].FactionBanB}</li>
                                <li className="list-group-item staticGreen"><b>{factionsPickBanByPlayer[0].FactionPickA}</b></li>
                                <li className="list-group-item staticGreen"><b>{factionsPickBanByPlayer[0].FactionPickB}</b></li>
                            </ul>
                        </div>
                        <div className="col-12 col-lg-6 mt-2 mb-3 d-flex justify-content-center">
                            <ul className="list-group w-100 text-center">
                                <li className="list-group-item staticHeaderTxtPlayerBlue">{namePlayers.J2}</li>
                                <li className="list-group-item staticRed">{factionsPickBanByPlayer[1].FactionBanA}</li>
                                <li className="list-group-item staticRed">{factionsPickBanByPlayer[1].FactionBanB}</li>
                                <li className="list-group-item staticGreen"><b>{factionsPickBanByPlayer[1].FactionPickA}</b></li>
                                <li className="list-group-item staticGreen"><b>{factionsPickBanByPlayer[1].FactionPickB}</b></li>
                            </ul>
                        </div>
                        {nbJoueursSelected >= 1 && 
                        <div className="col-12 col-lg-6 mt-2 d-flex justify-content-center">
                            <ul className="list-group w-100 text-center">
                                <li className="list-group-item staticHeaderTxtPlayerYellow">{namePlayers.J3}</li>
                                <li className="list-group-item staticRed">{factionsPickBanByPlayer[2].FactionBanA}</li>
                                <li className="list-group-item staticRed">{factionsPickBanByPlayer[2].FactionBanB}</li>
                                <li className="list-group-item staticGreen"><b>{factionsPickBanByPlayer[2].FactionPickA}</b></li>
                                <li className="list-group-item staticGreen"><b>{factionsPickBanByPlayer[2].FactionPickB}</b></li>
                            </ul>
                        </div>
                        }
                        {nbJoueursSelected >= 2 && 
                        <div className="col-12 col-lg-6 mt-2 d-flex justify-content-center">
                            <ul className="list-group w-100 text-center">
                                <li className="list-group-item staticHeaderTxtPlayerGreen">{namePlayers.J4}</li>
                                <li className="list-group-item staticRed">{factionsPickBanByPlayer[3].FactionBanA}</li>
                                <li className="list-group-item staticRed">{factionsPickBanByPlayer[3].FactionBanB}</li>
                                <li className="list-group-item staticGreen"><b>{factionsPickBanByPlayer[3].FactionPickA}</b></li>
                                <li className="list-group-item staticGreen"><b>{factionsPickBanByPlayer[3].FactionPickB}</b></li>
                            </ul>
                        </div>
                        }
                        
                        {currentEtapeDraft >= 3 ? !draftTermine && 
                            <div
                            id={styles.btnRollBack}
                            className={lastFactionSaisieForRollback?.codeFaction ? "btn-ColorA" : "btn-ColorInactif"}
                            onClick={lastFactionSaisieForRollback?.codeFaction ? handleClickOnRollback : undefined}
                            >
                            <i className="bx bxs-eraser bx-sm"></i>
                            </div>
                        : <></>}
                    </div>
                </>
                }
            </div>
            {!draftTermine ? currentEtapeDraft >= 2 && 
                <div className={styles.bandeauInstructionDraft}>
                    <div className="col-12 d-flex justify-content-center">
                        {!draftTermine ?
                            <h5 className="text-center"><span className={`${txtCurrentPlayerColor}`}><b>{txtCurrentPlayer}</b></span>&nbsp;<span className={`${txtCurrentInstructionColor}`}>{txtCurrentInstruction}</span></h5>
                                :
                            <h5 className={`text-center txtColorWhite`}>Le draft est à présent terminé !</h5>
                        }
                    </div>
                </div>
            : <></>}
        </>
    );
}

export default Smashup;
