    import {useState, useMemo, useEffect} from 'react';
    import styles from './draftKeyforgePartVueListeCartesValidees.module.css';
    //import CardForList from '../../components/others/CardForList';
    import { useKeyforgeContext } from '../../../src/components/contexts/keyforgeContext';
    import useApiFetch from "../../api/useApiFetch";


    const DraftKeyforgePartVueListeCartesValidees = ({currentDraftKeyforge, setCurrentDraftKeyforge, draftEnCoursParJoueurAouB, setdraftEnCoursParJoueurAouB, draftEnCoursSurFactionAouBouC, setDraftEnCoursSurFactionAouBouC, setEtapeDraft}) => {
        const { cartesValidees, setCartesValidees } = useKeyforgeContext();
        console.log('currentDraftKeyforge', currentDraftKeyforge);
        console.log('draftEnCoursParJoueurAouB', draftEnCoursParJoueurAouB);
        return (
                <>
                    <div className="row mb-4">
                        <div className="col-12 
                        mt-2 
                        d-flex 
                        justify-content-center"
                        >
                            <h4 className="text-center txtColorWhite">Liste des cartes validées</h4>
                        </div>
                    </div>
                        <div className="col-12 mt-4 d-flex justify-content-center">
                            <p>
                                <img  
                                    src={currentDraftKeyforge[0].lienImgAJ1?.replaceAll("\\", "/")}
                                    alt="Logo de la faction" 
                                    className={styles.logoFactionBig}
                                />
                            </p>
                            <p>
                                <img  
                                    src={currentDraftKeyforge[0].lienImgBJ1?.replaceAll("\\", "/")}
                                    alt="Logo de la faction" 
                                    className={styles.logoFactionBig}
                                />
                            </p>
                            <p>
                                <img  
                                    src={currentDraftKeyforge[0].lienImgCJ1?.replaceAll("\\", "/")}
                                    alt="Logo de la faction" 
                                    className={styles.logoFactionBig}
                                />
                            </p>
                        </div>
                </>
        )
    };

    export default DraftKeyforgePartVueListeCartesValidees;