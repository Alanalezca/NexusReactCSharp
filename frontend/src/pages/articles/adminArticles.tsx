import { useState, useEffect } from 'react';
import styles from './adminArticles.module.css';
import Loader from '../../components/others/Loader';
import { Link } from 'react-router-dom';
import { useOngletAlerteContext } from '../../components/contexts/ToastContext';
import { handleDeleteArticle } from '../../functions/callAPIx/articleDelete';
import { handleReversePublished } from '../../functions/callAPIx/articleReversePublish';
import Pagination from '../../components/others/Pagination';
import { useSessionUserContext } from '../../components/contexts/sessionUserContext';
import useApiFetch from "../../api/useApiFetch";

type ArticleAdmin = {
    codeArticle: string;
    titre: string;
    resume?: string;
    slug: string;
    contenu?: string;
    dateCreation?: string;
    dateMaj?: string;
    creePar?: number;
    pseudoCreateur?: string;
    lienImg?: string;
    tags?: string;
    publie?: boolean;
};
  
const ArticleAdminPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [articles, setArticles] = useState<ArticleAdmin[]>([]);
    const [forceRefresh, setForceRefresh] = useState(0);
    const { showOngletAlerte } = useOngletAlerteContext();
    const {sessionUser} = useSessionUserContext();
    const { callApiFetch } = useApiFetch();

    // Pagination : Début //
    const nbElementsParPage = 10;
    const [numCurrentPagePaginationActive, setNumCurrentPagePaginationActive] = useState(1);
    // Pagination : Fin //

    const indiceFirstElement = (nbElementsParPage * numCurrentPagePaginationActive) - nbElementsParPage;
    const indiceLastElement = ((nbElementsParPage * numCurrentPagePaginationActive));

    useEffect(() => {
        setIsLoading(true);
        if (sessionUser?.grade !== "Administrateur") {
            setIsLoading(false);
            return;
        }

        const callGetAllArticles = async () => {
            const data = await callApiFetch<ArticleAdmin[]>(
            "/api/articles/all",
            "Erreur lors du chargement des articles",
            setIsLoading
            );

            if (data) {
            setArticles(data);
            }
        };

        callGetAllArticles();
    }, [forceRefresh, sessionUser?.grade]);

    return (
        <div className={`container-xl mt-4 ${!isLoading && "txtColorWhite"}`}>
            {isLoading ?
            <Loader/> : 
            (sessionUser?.grade === "Administrateur" ?
            <>
                <div className="row">
                    <div className="col-12 mt-4">
                        <h2 className="text-center txtColorWhite">Administration des articles</h2>
                        <div className="row mt-5">
                            <div className="col-8 col-lg-4">
                                <b>Titre</b>
                            </div>
                            <div className="d-none d-lg-block col-lg-2">
                                <b>Date création</b>
                            </div>
                            <div className="d-none d-lg-block col-lg-2">
                                <b>Date màj</b>
                            </div>
                            <div className="d-none d-lg-block col-lg-2">
                                <b>Publié</b>
                            </div>
                            <div className="col-4 col-lg-2">
                            
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${styles.breakerTitre} mt-3`}></div>
                <div className="row d-flex align-items-center mb-4">
                    <div className="col-12 mt-3">
                    {articles.length > 0 ? (
                        articles.slice(indiceFirstElement, indiceLastElement).map((currentArticle) => (
                        <div key={currentArticle.slug} className="row mt-1">
                            <div className="col-8 col-lg-4">
                            <Link to={`/article/view/${currentArticle.slug}`}>
                                <span className="cPointer txtColorWhiteToTxtColorB">{currentArticle?.titre}</span>
                            </Link>
                            </div>
                            <div className="d-none d-lg-block col-lg-2">
                            <span>{currentArticle.dateCreation
                                ? new Date(currentArticle.dateCreation).toLocaleDateString('fr-FR')
                                : "-"
                            }</span>
                            </div>
                            <div className="d-none d-lg-block col-lg-2">
                            <span>{currentArticle.dateMaj
                                ? new Date(currentArticle.dateMaj).toLocaleDateString('fr-FR')
                                : "-"
                            }</span>
                            </div>
                            <div className="col-1 col-lg-2">
                            {currentArticle.publie ? 
                                <div className="d-inline"><i className="bx bx-cloud bxEnabledToDisabled topMinus3 cPointer" onClick={() => handleReversePublished(currentArticle.codeArticle, currentArticle.titre, currentArticle.publie, showOngletAlerte, setForceRefresh)}></i></div> :
                                <div className="d-inline"><i className="bx bx-cloud-upload bxDisabledToEnabled topMinus3 cPointer" onClick={() => handleReversePublished(currentArticle.codeArticle, currentArticle.titre, currentArticle.publie, showOngletAlerte, setForceRefresh)}></i></div>
                            }
                            </div>
                            <div className="col-3 col-lg-2">
                            <Link to={`/article/create/${currentArticle.slug}`}>
                                <div className="d-inline"><i className="bx bx-edit bxNormalOrange topMinus3 cPointer"></i></div>
                            </Link>
                                <div className="d-inline"><i className="bx bx-message-square-x bxNormalOrange topMinus3 cPointer" onClick={() => handleDeleteArticle(currentArticle.codeArticle, currentArticle.titre, showOngletAlerte, setForceRefresh)}></i></div>
                            </div>
                        </div>
                        ))
                    ) : (
                        <p>Aucun article disponible</p>
                    )}
                    </div>
                </div><Pagination centrer={true} totalNbElement={articles.length} nbElementParPage={nbElementsParPage} numCurrentPageActive={numCurrentPagePaginationActive} setterCurrentNumPageActive={setNumCurrentPagePaginationActive}/>
            </>
         : 
            <div className="row">
                <div className="col-12 col-lg-12 mt-5">
                <h2 className="mt-5 text-center txtColorWhite">L'administration des articles est réservée aux administrateurs</h2> 
                </div>
            </div>
      )
    }
        </div>
    )
};

export default ArticleAdminPage;
