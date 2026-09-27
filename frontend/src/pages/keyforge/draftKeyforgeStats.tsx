    import styles from './draftKeyforgeStats.module.css';
    import { useMemo } from 'react';
    import { useKeyforgeContext } from '../../../src/components/contexts/keyforgeContext';
    import ChartJSBar from '../../components/others/charts/ChartJSBar';
    import ChartJSPie from '../../components/others/charts/ChartJSPie';
    import DraftKeyforgeStatsResume from '../../pages/keyforge/draftKeyforgeStatsResume';
    
    const DraftKeyforgeStats = ({ currentDraft, focusSurJoueurAouBPhaseSelection, focusSurJoueurAouBforStatsPostSelection, statistiqueFocus }) => {

        const { cartesValidees, setCartesValidees } = useKeyforgeContext();
        
        const cartesValideesJoueurFocus = useMemo(() => {
            return cartesValidees.filter(item => item.joueurAouB == focusSurJoueurAouBPhaseSelection)
        }, [cartesValidees]);
        
        const labelsGraph0 = useMemo(() => {
            if (!currentDraft) return [];
            const factionsUniques = [currentDraft[0]?.[`libelleFactionAJ${focusSurJoueurAouBPhaseSelection +1}`], currentDraft[0]?.[`libelleFactionBJ${focusSurJoueurAouBPhaseSelection +1}`], currentDraft[0]?.[`libelleFactionCJ${focusSurJoueurAouBPhaseSelection +1}`]];
            return factionsUniques;
        
        }, [cartesValidees, focusSurJoueurAouBPhaseSelection, currentDraft]);

        const valuesGraph0 = useMemo(() => {
            if (!currentDraft) return [];
            const valueFactionA = cartesValidees.filter(item => item.idFaction === currentDraft[0]?.[`factionPickAJ${focusSurJoueurAouBPhaseSelection +1}`] && item.joueurAouB == focusSurJoueurAouBPhaseSelection).length;
            const valueFactionB = cartesValidees.filter(item => item.idFaction === currentDraft[0]?.[`factionPickBJ${focusSurJoueurAouBPhaseSelection +1}`] && item.joueurAouB == focusSurJoueurAouBPhaseSelection).length;
            const valueFactionC = cartesValidees.filter(item => item.idFaction === currentDraft[0]?.[`factionPickCJ${focusSurJoueurAouBPhaseSelection +1}`] && item.joueurAouB == focusSurJoueurAouBPhaseSelection).length;
            return [valueFactionA, valueFactionB, valueFactionC];
        
        }, [cartesValidees, focusSurJoueurAouBPhaseSelection, currentDraft]);


        const colorsGraph0 = useMemo(() => {
            if (!currentDraft) return [];
            const colorFactionA = 'rgba(' + currentDraft[0]?.[`couleurAJ${focusSurJoueurAouBPhaseSelection +1}`] + ',0.6';
            const colorFactionB = 'rgba(' + currentDraft[0]?.[`couleurBJ${focusSurJoueurAouBPhaseSelection +1}`] + ',0.6';
            const colorFactionC = 'rgba(' + currentDraft[0]?.[`couleurCJ${focusSurJoueurAouBPhaseSelection +1}`] + ',0.6';
            return [colorFactionA, colorFactionB, colorFactionC];
        }, [cartesValidees, focusSurJoueurAouBPhaseSelection, currentDraft]);

        const dataGraph1 = useMemo(() => {
            if (!currentDraft) return [[], []];

            const typesUniques = [...new Set(
                cartesValideesJoueurFocus.map(carte => carte.libelleType)
            )].sort();

            const comptage = typesUniques.map(type =>
                cartesValideesJoueurFocus.filter(
                    carte => carte.libelleType === type
                ).length
            );

            return [typesUniques, comptage];

        }, [cartesValidees, focusSurJoueurAouBPhaseSelection, currentDraft]);

        const colorsGraph1 = [
            'rgba(153, 102, 255, 0.75)',
            'rgba(255, 206, 86, 0.75)', 
            'rgba(255, 99, 132, 0.75)',
            'rgba(75, 192, 145, 0.75)',
        ];

        const nbLegendairesJoueurAetB = useMemo(() => {
            if (!currentDraft) return [0, 0];
            const NbLegendaireA = cartesValidees.filter(item => item.rarete === "Légendaire" && item.joueurAouB == 0).length;
            const NbLegendaireB = cartesValidees.filter(item => item.rarete === "Légendaire" && item.joueurAouB == 1).length;
            return [NbLegendaireA, NbLegendaireB];
        }, [cartesValidees]);

        return (
            <>
                {/* Comptage des cartes en cours de draft (0) */}
                {currentDraft[0]?.etat >= 10 && currentDraft[0]?.etat < 12 && statistiqueFocus === 0 &&
                    <ChartJSBar labels={labelsGraph0} values={valuesGraph0} colors={colorsGraph0} />
                }

                {/* Etat (0) pénalités */}
                {currentDraft[0]?.etat >= 12 && statistiqueFocus === 0 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    <DraftKeyforgeStatsResume nbLegendaires={nbLegendairesJoueurAetB} pseudoJ1={currentDraft[0]?.pseudoJ1} pseudoJ2={currentDraft[0]?.pseudoJ2}/> 
                </div>
                }

                {/* Etat (1) Répartition par type */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 1 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    <ChartJSPie labels={dataGraph1[0]} values={dataGraph1[1]} colors={colorsGraph1} title={"Répartition par type"} />
                </div>
                }

                {/* Etat (2) Répartition par faction */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 2 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    <ChartJSBar labels={labelsGraph0} values={valuesGraph0} colors={colorsGraph0} />
                </div>
                }

                {/* Etat (3) Puissance */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 3 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    <ChartJSBar labels={labelsGraph0} values={valuesGraph0} colors={colorsGraph0} />
                </div>
                }

                {/* Etat (4) Aombre généré */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 4 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    <ChartJSBar labels={labelsGraph0} values={valuesGraph0} colors={colorsGraph0} />
                </div>
                }

                {/* Etat (5) Raretés */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 5 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    <ChartJSBar labels={labelsGraph0} values={valuesGraph0} colors={colorsGraph0} />
                </div>
                }
            </>
        );
    };

    export default DraftKeyforgeStats;
