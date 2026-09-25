    import {useState, useMemo, useEffect} from 'react';
    import styles from './draftKeyforgePartVueListeCartesValidees.module.css';
    //import CardForList from '../../components/others/CardForList';
    import { useKeyforgeContext } from '../../../src/components/contexts/keyforgeContext';
    import useApiFetch from "../../api/useApiFetch";
    import TCGCardForList from "../../components/others/TCGCardForList"


    const DraftKeyforgePartVueListeCartesValidees = ({currentDraftKeyforge, setCurrentDraftKeyforge, draftEnCoursParJoueurAouB, setdraftEnCoursParJoueurAouB, draftEnCoursSurFactionAouBouC, setDraftEnCoursSurFactionAouBouC, setEtapeDraft}) => {
        const { cartesValidees, setCartesValidees } = useKeyforgeContext();
        const [showListSimpleActive, setShowListSimpleActive] = useState(true);
        console.log('currentDraftKeyforge', currentDraftKeyforge);
        console.log('draftEnCoursParJoueurAouB', draftEnCoursParJoueurAouB);
        console.log('cadeDejaValidee', cartesValidees);

        const cartesValideesAvecQuantite = useMemo(() => {

            const cartesRegroupees = cartesValidees.reduce((acc, carte) => {

                const carteExistante = acc.find(
                    current => current.idCarte === carte.idCarte
                );

                if (carteExistante) {
                    carteExistante.quantite += 1;
                } else {
                    acc.push({
                        ...carte,
                        quantite: 1
                    });
                }

                return acc;

            }, []);

            return cartesRegroupees.sort(
                (a, b) => (a.numero ?? 0) - (b.numero ?? 0)
            );

        }, [cartesValidees]);

        return (
                <>
                    <div className="row mb-2">
                        <div className="col-12 
                        mt-2 
                        d-flex 
                        justify-content-center"
                        >
                            <h4 className="text-center txtColorWhite">Liste des cartes validées</h4>
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-12 d-flex justify-content-center">
                            <div className={styles.btnLogo}>
                                <button className={`bx bx-list-ul ${showListSimpleActive ? "bxNormalOrange" : "bxNormalGrey"}`}></button>
                                <button className={`bx bxs-grid ${showListSimpleActive ? "bxNormalGrey" : "bxNormalOrange"}`}></button>
                            </div>
                        </div>
                    </div>
                    {cartesValideesAvecQuantite.map((current) => (
                        <TCGCardForList
                            key={current.idCarte}
                            quantite={current.quantite}
                            couleurFactionCarte={currentDraftKeyforge[0].couleurAJ1}
                            numeroCarte={current.numero}
                            nomCarte={current.libelleCarte}
                            imageCarte={current.cheminImgCarte?.replaceAll("\\", "/")}
                            rareteCarte={current.rarete}
                            lienImgFaction={current.lienImgFaction?.replaceAll("\\", "/")}
                            libelleType={current.libelleType}
                        />
                    ))}
                </>
        )
    };

    export default DraftKeyforgePartVueListeCartesValidees;