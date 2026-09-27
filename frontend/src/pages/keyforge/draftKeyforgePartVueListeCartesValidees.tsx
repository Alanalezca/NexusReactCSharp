    import {useState, useMemo, useEffect} from 'react';
    import styles from './draftKeyforgePartVueListeCartesValidees.module.css';
    //import CardForList from '../../components/others/CardForList';
    import { useKeyforgeContext } from '../../../src/components/contexts/keyforgeContext';
    import useApiFetch from "../../api/useApiFetch";
    import TCGCardForList from "../../components/others/TCGCardForList";
    import TCGCardVisuForList from "../../components/others/TCGCardVisuForList"


    const DraftKeyforgePartVueListeCartesValidees = ({currentDraftKeyforge, setCurrentDraftKeyforge, draftEnCoursParJoueurAouB, setdraftEnCoursParJoueurAouB, draftEnCoursSurFactionAouBouC, setDraftEnCoursSurFactionAouBouC, setEtapeDraft}) => {
        const { cartesValidees, setCartesValidees } = useKeyforgeContext();
        const [showListSimpleActive, setShowListSimpleActive] = useState(true);
        const [listeCartesMarquees, setListeCartesMarquees] = useState([]);
        console.log('currentDraftKeyforge', currentDraftKeyforge);
        console.log('draftEnCoursParJoueurAouB', draftEnCoursParJoueurAouB);
        console.log('cadeDejaValidee', cartesValidees);
        const couleurEtFactionsJoueurActif = useMemo(() => {
                return [currentDraftKeyforge[0][`factionPickAJ${currentDraftKeyforge[0].draftEnCoursPourJoueurAouB + 1}`],
                    currentDraftKeyforge[0][`couleurAJ${currentDraftKeyforge[0].draftEnCoursPourJoueurAouB + 1}`],
                    currentDraftKeyforge[0][`factionPickBJ${currentDraftKeyforge[0].draftEnCoursPourJoueurAouB + 1}`],
                    currentDraftKeyforge[0][`couleurBJ${currentDraftKeyforge[0].draftEnCoursPourJoueurAouB + 1}`],
                    currentDraftKeyforge[0][`factionPickCJ${currentDraftKeyforge[0].draftEnCoursPourJoueurAouB + 1}`],
                    currentDraftKeyforge[0][`couleurCJ${currentDraftKeyforge[0].draftEnCoursPourJoueurAouB + 1}`],]
        }, [currentDraftKeyforge[0].draftEnCoursPourJoueurAouB]);

        const attributionCouleurFaction = (
                codeFactionA,
                colorFactionA,
                codeFactionB,
                colorFactionB,
                codeFactionC,
                colorFactionC,
                idFaction
            ) => {
            switch(idFaction) {
                    case codeFactionA:
                        return colorFactionA;
                    case codeFactionB:
                        return colorFactionB;
                    case codeFactionC:
                        return colorFactionC;
                    default:
                        console.log('Couleur de faction non trouvée');
                        return null;
            }
        }


        const cartesValideesAvecQuantiteJoueurActif = useMemo(() => {

            const cartesRegroupees = cartesValidees
                .filter(
                    carte =>
                        carte.joueurAouB == currentDraftKeyforge[0].draftEnCoursPourJoueurAouB
                )
                .reduce((acc, carte) => {

                    const carteExistante = acc.find(
                        current => current.idCarte === carte.idCarte
                    );

                    if (carteExistante) {
                        carteExistante.quantite += 1;
                    } else {
                        acc.push({
                            ...carte,
                            quantite: 1,
                            couleurFaction: attributionCouleurFaction(
                                couleurEtFactionsJoueurActif[0],
                                couleurEtFactionsJoueurActif[1],
                                couleurEtFactionsJoueurActif[2],
                                couleurEtFactionsJoueurActif[3],
                                couleurEtFactionsJoueurActif[4],
                                couleurEtFactionsJoueurActif[5],
                                carte.idFaction
                            )
                        });
                    }

                    return acc;

                }, []);

            return cartesRegroupees.sort(
                (a, b) => (a.numero ?? 0) - (b.numero ?? 0)
            );

        }, [
            cartesValidees,
            currentDraftKeyforge[0].draftEnCoursPourJoueurAouB,
            couleurEtFactionsJoueurActif
        ]);

        const nbLegendairesValideesJoueurActif = useMemo(() => {

            const nbLegendaires = cartesValideesAvecQuantiteJoueurActif
                .filter(
                    carte =>
                        carte.rarete === "Légendaire"
                )

            return nbLegendaires.length;

        }, [
            cartesValideesAvecQuantiteJoueurActif
        ]);

        const ajoutSuppMarqueCarte = (numeroCarte) => {
            setListeCartesMarquees(prev => {
                if (prev.includes(numeroCarte)) {
                    return prev.filter(valeur => valeur !== numeroCarte);
                } else {
                    return [...prev, numeroCarte];
                }
            });
        };

        const verifSiCarteMarquee = (listeCartesMarquees, numeroCarteAVerif) => {
            if (listeCartesMarquees.includes(numeroCarteAVerif)) {
                return true;
            } else {
                return false;
            }
        }

        return (
                <>
                    <div className="row mb-2">
                        <div className="col-12 
                        mt-2  
                        justify-content-center"
                        >
                            <p><h4 className="text-center txtColorWhite">Liste des cartes validées</h4></p>
                            <p><h6 className="text-center txtColorWhite">(<span className="colorRareteLegendaire">{nbLegendairesValideesJoueurActif} légendaires</span>)</h6></p>
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-12 d-flex justify-content-center">
                            <div className={styles.btnLogo}>
                                <button 
                                    className={`bx bx-list-ul ${showListSimpleActive ? "bxNormalOrange" : "bxNormalGrey"}`}
                                    onClick={() => setShowListSimpleActive(true)}>
                                </button>
                                <button 
                                    className={`bx bxs-grid ${!showListSimpleActive ? "bxNormalOrange" : "bxNormalGrey"}`}
                                    onClick={() => setShowListSimpleActive(false)}>
                                </button>
                            </div>
                        </div>
                    </div>
                    {showListSimpleActive ?
                        cartesValideesAvecQuantiteJoueurActif.map((current) => (
                            <TCGCardForList
                                key={current.idCarte}
                                quantite={current.quantite}
                                couleurFactionCarte={current.couleurFaction}
                                numeroCarte={current.numero}
                                nomCarte={current.libelleCarte}
                                imageCarte={current.cheminImgCarte?.replaceAll("\\", "/")}
                                rareteCarte={current.rarete}
                                lienImgFaction={current.lienImgFaction?.replaceAll("\\", "/")}
                                libelleType={current.libelleType}
                                marquageCarte={ajoutSuppMarqueCarte}
                                flagCarteMarquee={verifSiCarteMarquee(listeCartesMarquees, current.numero)}
                            />
                        ))
                    :
                        <div className="row g-3">
                            {cartesValideesAvecQuantiteJoueurActif.map(current => (
                                <div
                                    key={current.idCarte}
                                    className="col-6 col-md-4 col-lg-3 col-xl-2"
                                >
                                    <TCGCardVisuForList
                                        nomCarte={current.libelleCarte}
                                        imageCarte={
                                            current.cheminImgCarte?.replaceAll("\\", "/")
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    }
                </>
        )
    };

    export default DraftKeyforgePartVueListeCartesValidees;