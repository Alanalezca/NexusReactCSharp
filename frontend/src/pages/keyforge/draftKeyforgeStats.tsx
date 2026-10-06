    import styles from './draftKeyforgeStats.module.css';
    import { useMemo, useState, useEffect } from 'react';
    import { useKeyforgeContext } from '../../../src/components/contexts/keyforgeContext';
    import ChartJSBar from '../../components/others/charts/ChartJSBar';
    import ChartJSBarStacked from '../../components/others/charts/ChartJSBarStacked';
    import ChartJSPie from '../../components/others/charts/ChartJSPie';
    import DraftKeyforgeStatsResume from '../../pages/keyforge/draftKeyforgeStatsResume';
    import useApiFetch from "../../api/useApiFetch";
    
    interface KeyforgeTypeCarte {
        id: string;
        libelle: string | null;
        colorRGB: string | null;
    }

    const DraftKeyforgeStats = ({ currentDraft, statistiqueFocus }) => {

        const [typesCartes, setTypesCartes] = useState<KeyforgeTypeCarte[]>([]);
        const { cartesValidees, setCartesValidees } = useKeyforgeContext();
        const { callApiFetch } = useApiFetch();

        useEffect(() => {

            const fetchTypesCartes = async () => {

                const data = await callApiFetch<KeyforgeTypeCarte[]>(
                    "/api/keyforge/types-cartes",
                    "Erreur lors du chargement des types de cartes KeyForge"
                );

                if (data) {
                    setTypesCartes(data);
                }
            };

            fetchTypesCartes();

        }, []);


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

        const colorsGraph1 = useMemo(() => {
            const couleurs = dataGraph1[0].map(libelle => {

                const typeTrouve = typesCartes.find(
                    type => type.libelle === libelle
                );

                return typeTrouve?.colorRGB;
            });

            return couleurs;
        }, [dataGraph1]); 

        console.log('colorsGraph0DraftEnCours', colorsGraph0DraftEnCours, labelsGraph0DraftEnCours);

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

        const comptageParTypeParFactionPourJoueurFocus = (cartesValidees, joueurAouB, factionAouBouC) => {
            const cartesFactionA = cartesValidees.filter(carte =>
                carte.joueurAouB == joueurAouB
                &&
                carte.idFaction === currentDraft[0][
                    `factionPick${factionAouBouC}J${joueurAouB + 1}`
                ]
            );

            const comptageParType = cartesFactionA.reduce((acc, carte) => {

                const type = carte.libelleType;

                acc[type] = (acc[type] || 0) + 1;

                return acc;

            }, {});

            return comptageParType;
        };

        const datasetGraph2Base = useMemo(() => {

            const [comptageFactionA, comptageFactionB, comptageFactionC] = 
                [comptageParTypeParFactionPourJoueurFocus(
                    cartesValidees, 
                    currentDraft[0].draftEnCoursPourJoueurAouB, 
                    'A'),
                comptageParTypeParFactionPourJoueurFocus(
                    cartesValidees, 
                    currentDraft[0].draftEnCoursPourJoueurAouB, 
                    'B'),
                comptageParTypeParFactionPourJoueurFocus(
                    cartesValidees, 
                    currentDraft[0].draftEnCoursPourJoueurAouB, 
                'C')];
            
            return [comptageFactionA, comptageFactionB, comptageFactionC];
        }, [cartesValidees, currentDraft]);

        const datasetsGraph2ForChart = useMemo(() => {

            return typesCartes.map(type => ({
                label: type.libelle ?? "",

                values: datasetGraph2Base.map(faction =>
                    faction[type.libelle ?? ""] ?? 0
                ),

                color: type.colorRGB ?? "rgba(255, 255, 255, 0.75)"
            }));

        }, [datasetGraph2Base]);

        const labelsGraph2 = useMemo (() => {
            return [currentDraft[0][`libelleFactionAJ${currentDraft[0].draftEnCoursPourJoueurAouB + 1}`],
                currentDraft[0][`libelleFactionBJ${currentDraft[0].draftEnCoursPourJoueurAouB + 1}`],
                currentDraft[0][`libelleFactionCJ${currentDraft[0].draftEnCoursPourJoueurAouB + 1}`]];

        }, [datasetsGraph2ForChart])

        const labelsGraph3 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9+"];

        const comptageCarteSelonPuissance = (libelleFaction, colorFaction) => {
            const arrayValues = cartesValidees
                .filter(current =>
                    current.libelleFaction === libelleFaction && current.libelleType === "Créature"
                )
                .reduce(
                    (acc, carte) => {

                        if (carte.puissance === null) {
                            return acc;
                        }

                        const index = carte.puissance;

                        if (index < 9) {
                            acc[index] += 1;
                        } else {
                            acc[9] += 1;
                        }

                        return acc;
                    },
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                );
            
            return {color: colorFaction, label: libelleFaction, values: arrayValues}
        };

        const datasetsGraph3ForChart = useMemo(() => {
           
            return [
                comptageCarteSelonPuissance(currentDraft[0]?.[`libelleFactionAJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`], 
                'rgba(' + currentDraft[0]?.[`couleurAJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`] + ',0.6'),
                comptageCarteSelonPuissance(currentDraft[0]?.[`libelleFactionBJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`], 
                'rgba(' + currentDraft[0]?.[`couleurBJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`] + ',0.6'),
                comptageCarteSelonPuissance(currentDraft[0]?.[`libelleFactionCJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`], 
                'rgba(' + currentDraft[0]?.[`couleurCJ${currentDraft[0].draftEnCoursPourJoueurAouB +1}`] + ',0.6')
            ];

        }, [cartesValidees, currentDraft]);
        console.log('exemple', datasetsGraph2ForChart);
        console.log('tartare', cartesValidees, datasetsGraph3ForChart);
        return (
            <>
                {/* Comptage des cartes en cours de draft (0) */}
                {currentDraft[0]?.etat >= 10 && currentDraft[0]?.etat < 12 && statistiqueFocus === 0 &&
                    <ChartJSBar labels={labelsGraph0DraftEnCours} values={valuesGraph0DraftEnCours} colors={colorsGraph0DraftEnCours} title={""} labelTitreData={""}/>
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

                {/* Etat (2) Répartition types par faction */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 2 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    {currentDraft[0].draftEnCoursPourJoueurAouB !== null ?
                        <ChartJSBarStacked labels={labelsGraph2} datasets={datasetsGraph2ForChart} title={"Répartition types par faction"} />
                    :
                        <div>Choisissez la liste de cartes d'un joueur</div>
                    }
                </div>
                }

                {/* Etat (3) Puissance */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 3 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    {currentDraft[0].draftEnCoursPourJoueurAouB !== null ?
                        <ChartJSBarStacked labels={labelsGraph3} datasets={datasetsGraph3ForChart} title={"Créatures par puissance"}  titleToolTip="Créature avec une puissance de "/>
                    :
                        <div>Choisissez la liste de cartes d'un joueur</div>
                    }
                </div>
                }

                {/* Etat (4) Aombre généré */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 4 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    
                </div>
                }

                {/* Etat (5) Raretés */}
                {currentDraft[0]?.etat >= 10 && statistiqueFocus === 5 &&
                <div className="d-flex justify-content-center align-items-center h-100">
                    
                </div>
                }
            </>
        );
    };

    export default DraftKeyforgeStats;
