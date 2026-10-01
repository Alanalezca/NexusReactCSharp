    import styles from './draftKeyforgeStats.module.css';
    import { useMemo } from 'react';
    import { useKeyforgeContext } from '../../../src/components/contexts/keyforgeContext';
    import ChartJSBar from '../../components/others/charts/ChartJSBar';
    import ChartJSPie from '../../components/others/charts/ChartJSPie';
    import DraftKeyforgeStatsResume from '../../pages/keyforge/draftKeyforgeStatsResume';
    
    const DraftKeyforgeStats = ({ currentDraft, statistiqueFocus }) => {

        const { cartesValidees, setCartesValidees } = useKeyforgeContext();

        const cartesValideesJoueurFocus = useMemo(() => {
            return cartesValidees.filter(item => item.joueurAouB == currentDraft[0].draftEnCoursPourJoueurAouB)
        }, [cartesValidees, currentDraft]);

        const labelsGraph0DraftEnCours = useMemo(() => {
            if (!currentDraft) return [];
            const factionsUniques = [currentDraft[0]?.[`libelleFactionAJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`], currentDraft[0]?.[`libelleFactionBJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`], currentDraft[0]?.[`libelleFactionCJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`]];
            return factionsUniques;
        
        }, [cartesValidees, currentDraft]);

        const valuesGraph0DraftEnCours = useMemo(() => {
            if (!currentDraft) return [];
            const valueFactionA = cartesValidees.filter(item => item.idFaction === currentDraft[0]?.[`factionPickAJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`] && item.joueurAouB == currentDraft[0].draftEnCoursPourJoueurAouB).length;
            const valueFactionB = cartesValidees.filter(item => item.idFaction === currentDraft[0]?.[`factionPickBJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`] && item.joueurAouB == currentDraft[0].draftEnCoursPourJoueurAouB).length;
            const valueFactionC = cartesValidees.filter(item => item.idFaction === currentDraft[0]?.[`factionPickCJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`] && item.joueurAouB == currentDraft[0].draftEnCoursPourJoueurAouB).length;
            return [valueFactionA, valueFactionB, valueFactionC];
        
        }, [cartesValidees, currentDraft]);

        
        const colorsGraph0DraftEnCours = useMemo(() => {
            if (!currentDraft) return [];
            const colorFactionA = 'rgba(' + currentDraft[0]?.[`couleurAJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`] + ',0.6';
            const colorFactionB = 'rgba(' + currentDraft[0]?.[`couleurBJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`] + ',0.6';
            const colorFactionC = 'rgba(' + currentDraft[0]?.[`couleurCJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`] + ',0.6';
            return [colorFactionA, colorFactionB, colorFactionC];
        }, [cartesValidees, currentDraft]);

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

        }, [cartesValidees, currentDraft]);

        const colorsGraph1 = [
            'rgba(153, 102, 255, 0.75)',
            'rgba(255, 206, 86, 0.75)', 
            'rgba(255, 99, 132, 0.75)',
            'rgba(75, 192, 145, 0.75)',
        ];

        const dataGraph0 = useMemo(() => {
            if (!currentDraft) return [0, 0];
            const NbLegendaireA = cartesValidees.filter(item => item.rarete === "Légendaire" && item.joueurAouB == 0).length;
            const NbLegendaireB = cartesValidees.filter(item => item.rarete === "Légendaire" && item.joueurAouB == 1).length;
            return [NbLegendaireA, NbLegendaireB];
        }, [cartesValidees]);

        const deltaLegendaires = Math.abs(dataGraph0[0] - dataGraph0[1]);

        const colorsGraph0 = [
            'rgba(229, 57, 53, 0.75)',
            'rgba(33, 75, 190, 0.75)'
        ];

        const joueurPorteurMalus =
        dataGraph0[0] > dataGraph0[1]
            ? 0
            : dataGraph0[1] > dataGraph0[0]
            ? 1
            : null;

        const joueur =
        joueurPorteurMalus === 0
            ? currentDraft[0]?.pseudoJ1
            : joueurPorteurMalus === 1
            ? currentDraft[0]?.pseudoJ2
            : null;

        const classeCouleur =
        joueurPorteurMalus === 0
            ? 'txtColorPlayerRed'
            : joueurPorteurMalus === 1
            ? 'txtColorPlayerBlue'
            : '';

        const labelTitreData0 = 
            "Nombre de légendaires"
        ;
        console.log('currentDraft[0].draftEnCoursPourJoueurAouB', currentDraft[0].draftEnCoursPourJoueurAouB);
        return (
            <>
                {/* Comptage des cartes en cours de draft (0) */}
                {currentDraft[0]?.etat >= 10 && currentDraft[0]?.etat < 12 && statistiqueFocus === 0 &&
                    <ChartJSBar labels={labelsGraph0DraftEnCours} values={valuesGraph0DraftEnCours} colors={colorsGraph0DraftEnCours} />
                }

                {/* Etat (0) pénalités */}
                {currentDraft[0]?.etat >= 12 && statistiqueFocus === 0 &&
                    <div className="d-flex flex-column justify-content-center align-items-center h-100">

                        <ChartJSBar
                            labels={[
                                currentDraft[0]?.pseudoJ1,
                                currentDraft[0]?.pseudoJ2
                            ]}
                            values={dataGraph0}
                            colors={colorsGraph0}
                            title={"Pénalités sous forme de chaînes"}
                            labelTitreData={labelTitreData0}
                        />

                        <div>
                            {deltaLegendaires > 0 ? (
                                <p className="txtBold">
                                    <span className={classeCouleur}>
                                        {joueur}
                                    </span>
                                    {" "}subit un malus :
                                    <span className={classeCouleur}>
                                        {" "}{deltaLegendaires}
                                    </span>
                                    &nbsp;chaîne{deltaLegendaires > 1 && "s"}
                                </p>
                            ) : (
                                <p className="txtBold">
                                    Aucun chaînage n'est appliqué
                                </p>
                            )}
                        </div>

                    </div>
                }

                {/* Etat (1) Répartition par type */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 1 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    {currentDraft[0].draftEnCoursPourJoueurAouB !== null ?
                        <ChartJSPie labels={dataGraph1[0]} values={dataGraph1[1]} colors={colorsGraph1} title={"Répartition par type"} />
                    :
                        <div>Choisissez la liste de cartes d'un joueur</div>
                    }   
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
