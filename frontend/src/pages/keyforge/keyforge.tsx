import {useState, useRef, useEffect} from 'react';
import { Link } from 'react-router-dom';
import styles from './keyforge.module.css';
import ModalCreateNewDraftKeyforge from '../../components/modals/CreateNewDraftKeyforge';
import Accordeon from '../../components/others/Accordeon';
import Pagination from '../../components/others/Pagination';
import { useSessionUserContext } from '../../components/contexts/sessionUserContext';
import { useOngletAlerteContext } from '../../components/contexts/ToastContext';
import Loader from '../../components/others/Loader';
import useApiFetch from "../../api/useApiFetch";

type KeyforgeDraftSummary = {
    id: string;
    titre: string;
    etat?: number | null;
    draftJ1Finished?: boolean | null;
    draftJ2Finished?: boolean | null;
    lienImgFactionPickAJ1?: string | null;
    lienImgFactionPickBJ1?: string | null;
    lienImgFactionPickCJ1?: string | null;
    lienImgFactionPickAJ2?: string | null;
    lienImgFactionPickBJ2?: string | null;
    lienImgFactionPickCJ2?: string | null;
    dateCreation?: string | null;
    dateDerModif?: string | null;
};

const DraftStatus = ({ draft }: { draft: KeyforgeDraftSummary }) => {
    const etat = draft.etat ?? 0;
    let icon = 'bx-circle';
    let colorClass = styles.statusPending;
    let label = 'Maisons à choisir';

    if (etat >= 12) {
        colorClass = styles.statusFinished;
        icon = 'bxs-circle';
        label = 'Draft terminé';
    } else if (etat >= 10 && (draft.draftJ1Finished || draft.draftJ2Finished)) {
        colorClass = styles.statusInProgress;
        icon = 'bxs-circle-three-quarter';
        label = 'Draft en cours : un joueur a terminé';
    } else if (etat === 11) {
        colorClass = styles.statusInProgress;
        icon = 'bxs-circle-half';
        label = 'Draft en cours';
    } else if (etat === 10) {
        colorClass = styles.statusReady;
        icon = 'bxs-circle-quarter';
        label = 'Draft prêt';
    } else if (etat === 9) {
        colorClass = styles.statusPreparing;
        label = 'Génération du pool de cartes';
    } else if (etat >= 1) {
        colorClass = styles.statusPreparing;
        label = 'Choix des maisons en cours';
    }

    return <i className={`bx ${icon} ${styles.draftStatus} ${styles.draftActionIcon} ${colorClass}`} role="img" aria-label={label} title={label} />;
};

const Keyforge = () => {
    const { callApiFetch } = useApiFetch();
    const { showOngletAlerte } = useOngletAlerteContext();
    const [isLoading, setIsLoading] = useState(true);
    const [listeMyDrafts, setListeMyDrafts] = useState<KeyforgeDraftSummary[]>([]);
    const [showFormCreateNewDraft, setShowFormCreateNewDraft] = useState(false);

    const {sessionUser} = useSessionUserContext();
    // Pagination : Début //
    const nbElementsParPage = 10;
    const [numCurrentPagePaginationActive, setNumCurrentPagePaginationActive] = useState(1);
    // Pagination : Fin //

    const nbPages = Math.max(1, Math.ceil(listeMyDrafts.length / nbElementsParPage));

    // Une suppression peut faire disparaître la page actuellement affichée.
    if (numCurrentPagePaginationActive > nbPages) {
        setNumCurrentPagePaginationActive(nbPages);
    }

    const indiceFirstElement = (nbElementsParPage * numCurrentPagePaginationActive) - nbElementsParPage;
    const indiceLastElement = ((nbElementsParPage * numCurrentPagePaginationActive));

    useEffect(() => {
        if (!sessionUser?.id) return;

        const fetchMyDrafts = async () => {
            const data = await callApiFetch<KeyforgeDraftSummary[]>(
                '/api/keyforge/my-drafts',
                'Erreur lors du chargement de vos drafts KeyForge',
                setIsLoading
            );

            if (data) {
                setListeMyDrafts(data);
            }
        };

        fetchMyDrafts();
    }, [sessionUser?.id]);

    const handleDeleteDraft = async (
        codeDraft: string,
        titreDraft: string
    ) => {
        const result = await callApiFetch(
            `/api/keyforge/draft/${encodeURIComponent(codeDraft)}`,
            'Erreur lors de la suppression du draft KeyForge',
            undefined,
            {
                method: 'DELETE'
            }
        );

        if (!result) {
            return;
        }

        showOngletAlerte(
            'success',
            '(Suppression draft)',
            '',
            `Le draft KeyForge "${titreDraft}" a bien été supprimé.`
        );

        setListeMyDrafts(prev =>
            prev.filter(current => current.id !== codeDraft)
        );
    };

    return (
            <div className="container-xl mt-3">
                    <div className="row mb-4">
                        <div className="col-12">
                            <h2 className="mt-4 text-center txtColorWhite">Keyforge : Deckbuilder par trinomes</h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 col-lg-8 offset-lg-2 d-flex justify-content-center ">
                            <img src="\images\keyforge\banniere.png" className="img-fluid rounded-2" alt="..."></img>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 mt-5">   
                            <Accordeon blocSoloOrTopOrMidOrBot="Solo" textTitre="Un module de deckbuilding pour Keyforge ?" textMain={`Ce module permet de réaliser un draft de type <b>"Trinômes"</b> (façon Arène de Hearthstone) pour le jeu <b>Keyforge</b>.<br /><br />
                                Voici le déroulement :<br />
                                1. Créez un nouveau draft en choisissant le <b>Set de jeu</b>.<br />
                                2. Réalisez la <b>phase de Pick/Ban des maisons</b> pour les deux joueurs.<br />
                                3. Une fois les maisons validées, passez au <b>Draft des cartes</b> : pour chaque maison, vous devrez choisir 12 cartes parmis des propositions de trinômes.<br />
                                4. Exportez votre liste et jouez !`}/>
                        </div>
                    </div>
                {(sessionUser ?
                <><ModalCreateNewDraftKeyforge show={showFormCreateNewDraft} handleClose={setShowFormCreateNewDraft} handleRefresh={setListeMyDrafts}/>
                    <div className="row">
                        <div className="col-12 mt-4">
                            <h2 className="text-center txtColorWhite mb-4">Mes drafts</h2>
                            <i className={`bx bx-list-plus bxNormalOrange`} onClick={() => {setShowFormCreateNewDraft(true)}}></i>
                            <div className="row d-none d-lg-flex">
                                <div className="col-4 col-lg-4">
                                    <b>Draft</b>
                                </div>
                                <div className="col-4 col-lg-2">
                                    <b>Maisons J1</b>
                                </div>
                                <div className="col-4 col-lg-2">
                                    <b>Maisons J2</b>
                                </div>
                                <div className="d-none d-lg-block col-lg-1">
                                    <b>Création</b>
                                </div>
                                <div className="d-none d-lg-block col-lg-1">
                                    <b>Der. màj</b>
                                </div>
                                <div className="col-4 col-lg-2">
                                
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.breakerTitre} mt-3`}></div>
                    <div className="row d-flex align-items-center mb-4">
                        <div className="col-12 mt-3">
                        {isLoading ?
                        <Loader/> : <>
                        {listeMyDrafts?.length > 0 ? (
                            listeMyDrafts.slice(indiceFirstElement, indiceLastElement).map((currentDraft) => (
                            <div key={currentDraft.id} className={`row ${styles.draftRow}`}>
                                <div className={`col-12 col-lg-4 ${styles.draftTitle}`}>
                                    <Link to={`/draftKeyforge/${currentDraft.id}`}>
                                        <span className="cPointer txtColorWhiteToTxtColorB">{currentDraft?.titre}</span>
                                    </Link>
                                </div>
                                <div className={`col-6 col-lg-2 ${styles.draftHouses}`}>
                                    <span className={`d-lg-none ${styles.mobileLabel}`}>Maisons J1</span>
                                    <img 
                                        src={currentDraft.lienImgFactionPickAJ1 || "/images/keyforge/NC.png"} 
                                        alt="Logo de la faction A du joueur 1" 
                                        className={styles.logoFaction}
                                    />
                                    <img 
                                        src={currentDraft.lienImgFactionPickBJ1 || "/images/keyforge/NC.png"} 
                                        alt="Logo de la faction A du joueur 1" 
                                        className={styles.logoFaction}
                                    />
                                    <img 
                                        src={currentDraft.lienImgFactionPickCJ1 || "/images/keyforge/NC.png"} 
                                        alt="Logo de la faction A du joueur 1" 
                                        className={styles.logoFaction}
                                    />
                                </div>
                                <div className={`col-6 col-lg-2 ${styles.draftHouses}`}>
                                    <span className={`d-lg-none ${styles.mobileLabel}`}>Maisons J2</span>
                                    <img 
                                        src={currentDraft.lienImgFactionPickAJ2 || "/images/keyforge/NC.png"} 
                                        alt="Logo de la faction A du joueur 2"
                                        className={styles.logoFaction}
                                    />
                                    <img 
                                        src={currentDraft.lienImgFactionPickBJ2 || "/images/keyforge/NC.png"} 
                                        alt="Logo de la faction B du joueur 2"
                                        className={styles.logoFaction}
                                    />
                                    <img 
                                        src={currentDraft.lienImgFactionPickCJ2 || "/images/keyforge/NC.png"} 
                                        alt="Logo de la faction C du joueur 2"
                                        className={styles.logoFaction}
                                    />
                                </div>
                                <div className="d-none d-lg-block col-lg-1">
                                <span>{new Date(currentDraft?.dateCreation).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="d-none d-lg-block col-lg-1">
                                <span>{new Date(currentDraft?.dateDerModif).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className={`col-12 col-lg-2 ${styles.draftActions}`}>
                                    <DraftStatus draft={currentDraft} />
                                    <button
                                        type="button"
                                        className={`${styles.deleteDraftButton}`}
                                        aria-label={`Supprimer le draft ${currentDraft.titre}`}
                                        title="Supprimer le draft"
                                        onClick={() => handleDeleteDraft(currentDraft.id, currentDraft.titre)}
                                    >
                                        <i className={`bx bx-message-square-x bxNormalOrange ${styles.draftActionIcon}`} aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                            ))
                        ) : (
                            <p>Aucun draft créé</p>
                        )}</>}
                        </div>
                    </div>
                    <div className="mt-5 mb-5">
                        <Pagination centrer={true} totalNbElement={listeMyDrafts?.length} nbElementParPage={nbElementsParPage} numCurrentPageActive={numCurrentPagePaginationActive} setterCurrentNumPageActive={setNumCurrentPagePaginationActive}/>
                    </div>
                </>
                     : 
                    <div className="row">
                        <div className="col-12 col-lg-12 mt-1 mb-5">
                            <h2 className="mt-5 text-center txtColorWhite">Le module de deckbuilding Keyforge requiert d'être connecté.</h2> 
                        </div>
                    </div>
                )}
            </div>
    )
};

export default Keyforge;
