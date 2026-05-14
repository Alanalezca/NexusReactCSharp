import Card from '../../components/others/Card';
import CardLarge from '../../components/others/CardLarge';
import CardLoading from '../../components/others/CardLoading';
import CardLargeLoading from '../../components/others/CardLargeLoading';
import Pagination from '../../components/others/Pagination';
import styles from './articles.module.css';
import { useState, useEffect } from 'react';
import { apiFetch } from "../../api/client";

const Articles = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [tagsArticlesActifs, setTagsArticlesActifs] = useState([]);
    const [tagsSelectForFilter, setTagsSelectForFilter] = useState([]);
    const [articles, setArticles] = useState([]);
    const [articlesFiltered, setArticlesFiltered] = useState([]);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [inputRecherche, setInputRecherche] = useState("");
    const [activeGridTags, setActiveGridTag] = useState(false);

    // Pagination : Début //
    const nbElementsParPage = 10;
    const [numCurrentPagePaginationActive, setNumCurrentPagePaginationActive] = useState(1);
    // Pagination : Fin //

    const indiceFirstArticlePartA = (nbElementsParPage * numCurrentPagePaginationActive) - nbElementsParPage;
    const indiceLastArticlePartA = indiceFirstArticlePartA + 3;
    const indiceFirstArticlePartB = indiceLastArticlePartA;
    const indiceLastArticlePartB = indiceFirstArticlePartA + nbElementsParPage;

    useEffect(() => {
        apiFetch("/api/articles")
            .then(data => {
                console.log('resultat', data);

                setArticles(data);
                setArticlesFiltered(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erreur fetch articles:", error);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        const checkScreenSize = () => setIsLargeScreen(window.innerWidth >= 992);

        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Comptage des tags //
    const splitTags = (tagsString) => {
        if (typeof tagsString === 'string' && tagsString.trim() !== '') {
            return tagsString.split(',').map(tag => tag.trim());
        }

        return [];
    };

    // Récupération des tags associés aux articles actifs
    useEffect(() => {
        if (articles[0]?.codeArticle) {

            const tempAllTagsArticles = [];

            articles.forEach((currentArticle) => {
                tempAllTagsArticles.push(...splitTags(currentArticle.tags));
            });

            let allTagsArticlesWithCount = tempAllTagsArticles.reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {});

            allTagsArticlesWithCount = Object.entries(allTagsArticlesWithCount);

            const allTags = [];

            allTagsArticlesWithCount.forEach((current) => {
                allTags.push({
                    tag: current[0],
                    nb: current[1],
                    filtreActif: false
                });
            });

            setTagsArticlesActifs(allTags);
        }
    }, [articles]);

    // Activation / Désactivation du filtre sur les tags
    const handleClickFilterTagOnOff = (e) => {

        const tagAlreadySelected = tagsSelectForFilter.includes(e.tag);

        // Si le tag n'est pas encore sélectionné
        if (!tagAlreadySelected) {

            const tagsArticlesActifsModified = tagsArticlesActifs.map(current =>
                current.tag === e.tag
                    ? { ...current, filtreActif: !current.filtreActif }
                    : current
            );

            setTagsArticlesActifs(tagsArticlesActifsModified);

            setTagsSelectForFilter(prev => {

                if (!prev.includes(e.tag)) {
                    return [...prev, e.tag];
                }

                return prev;
            });

        // Si le tag est déjà sélectionné
        } else {

            const tagsArticlesActifsModified = tagsArticlesActifs.map(current =>
                current.tag === e.tag
                    ? { ...current, filtreActif: !current.filtreActif }
                    : current
            );

            setTagsArticlesActifs(tagsArticlesActifsModified);

            const tagsSelectForFilterModified = tagsSelectForFilter.filter(
                current => current !== e.tag
            );

            setTagsSelectForFilter(tagsSelectForFilterModified);
        }
    };

    // Application des tags + recherche texte
    useEffect(() => {

        const tempoArticlesFiltered = articles.filter(currentArticle => {

            const articleTagsArray = currentArticle?.tags
                ?.split(',')
                .map(tag => tag.trim().toLowerCase());

            if (tagsSelectForFilter.length > 0) {

                return tagsSelectForFilter.every(currentTag =>
                    articleTagsArray?.includes(currentTag.toLowerCase()) &&
                    (
                        currentArticle.titre?.includes(inputRecherche) ||
                        currentArticle.resume?.includes(inputRecherche)
                    )
                );

            } else {

                return (
                    currentArticle.titre?.includes(inputRecherche) ||
                    currentArticle.resume?.includes(inputRecherche)
                );
            }
        });

        setArticlesFiltered(tempoArticlesFiltered);

    }, [articles, tagsSelectForFilter, inputRecherche]);

    return (
        <div className="container-xl mt-4">

            <div className="row">

                {!isLargeScreen && (
                    <div className="d-flex justify-content-end">
                        <i
                            className={`bx bx-filter ${activeGridTags ? "bxNormalGrey" : "bxNormalOrange"}`}
                            onClick={() =>
                                activeGridTags
                                    ? setActiveGridTag(false)
                                    : setActiveGridTag(true)
                            }
                        />
                    </div>
                )}

                <div className="col-12 col-lg-9 order-2 order-lg-1">

                    <div className="p-3">

                        <div className="row row-cols-12 g-4">

                            {isLoading ? (
                                <>
                                    <CardLoading classCSSColorBackground="bgcolorC" tailleCol={isLargeScreen ? 4 : 12} />
                                    <CardLoading classCSSColorBackground="bgcolorC" tailleCol={isLargeScreen ? 4 : 12} />
                                    <CardLoading classCSSColorBackground="bgcolorC" tailleCol={isLargeScreen ? 4 : 12} />
                                </>
                            ) : (
                                <>
                                    {!articles[0] && (
                                        <h2 className="mt-4 text-center txtColorWhite">
                                            Aucun article ne correspond à vos critères
                                        </h2>
                                    )}

                                    {articlesFiltered
                                        .slice(indiceFirstArticlePartA, indiceLastArticlePartA)
                                        .map((currentArticles) => (

                                            <Card
                                                tailleCol={isLargeScreen ? 4 : 12}
                                                classCSSColorBackground="bgcolorC"
                                                cheminImg={currentArticles.lienImg}
                                                classCSSColorTxtTitre="txtColorA"
                                                titre={currentArticles.titre}
                                                classCSSColorTxtContenu="txtColorWhite"
                                                texteContenu={
                                                    currentArticles.resume?.length >= 170
                                                        ? currentArticles.resume.substring(0, 170) + "..."
                                                        : currentArticles.resume
                                                }
                                                classCSSColorTxtBottom="txtColorD"
                                                texteBottom={
                                                    currentArticles.dateCreation > currentArticles.dateMaj
                                                        ? new Date(currentArticles.dateCreation).toLocaleDateString('fr-FR')
                                                        : new Date(currentArticles.dateMaj).toLocaleDateString('fr-FR')
                                                }
                                                key={currentArticles.codeArticle}
                                                slugArticle={currentArticles.slug}
                                                tags={currentArticles.tags}
                                            />
                                        ))}
                                </>
                            )}
                        </div>

                        <div className="row row-cols-12 g-4 mt-1">

                            {isLoading ? (
                                isLargeScreen ? (
                                    <>
                                        <CardLargeLoading classCSSColorBackground="bgcolorC" />
                                        <CardLargeLoading classCSSColorBackground="bgcolorC" />
                                        <CardLargeLoading classCSSColorBackground="bgcolorC" />
                                    </>
                                ) : (
                                    <CardLoading classCSSColorBackground="bgcolorC" tailleCol={12} />
                                )
                            ) : (
                                <>
                                    {articlesFiltered
                                        .slice(indiceFirstArticlePartB, indiceLastArticlePartB)
                                        .map((currentArticles) => (

                                            isLargeScreen ? (

                                                <CardLarge
                                                    classCSSColorBackground="bgcolorC"
                                                    cheminImg={currentArticles.lienImg}
                                                    classCSSColorTxtTitre="txtColorA"
                                                    titre={currentArticles.titre}
                                                    classCSSColorTxtContenu="txtColorWhite"
                                                    texteContenu={
                                                        currentArticles.resume?.length >= 270
                                                            ? currentArticles.resume.substring(0, 270) + "..."
                                                            : currentArticles.resume
                                                    }
                                                    classCSSColorTxtBottom="txtColorD"
                                                    texteBottom={
                                                        currentArticles.dateCreation > currentArticles.dateMaj
                                                            ? new Date(currentArticles.dateCreation).toLocaleDateString('fr-FR')
                                                            : new Date(currentArticles.dateMaj).toLocaleDateString('fr-FR')
                                                    }
                                                    key={currentArticles.codeArticle}
                                                    slugArticle={currentArticles.slug}
                                                    tags={currentArticles.tags}
                                                />

                                            ) : (

                                                <Card
                                                    classCSSColorBackground="bgcolorC"
                                                    cheminImg={currentArticles.lienImg}
                                                    classCSSColorTxtTitre="txtColorA"
                                                    titre={currentArticles.titre}
                                                    classCSSColorTxtContenu="txtColorWhite"
                                                    texteContenu={
                                                        currentArticles.resume?.length >= 170
                                                            ? currentArticles.resume.substring(0, 170) + "..."
                                                            : currentArticles.resume
                                                    }
                                                    classCSSColorTxtBottom="txtColorD"
                                                    texteBottom={
                                                        currentArticles.dateCreation > currentArticles.dateMaj
                                                            ? new Date(currentArticles.dateCreation).toLocaleDateString('fr-FR')
                                                            : new Date(currentArticles.dateMaj).toLocaleDateString('fr-FR')
                                                    }
                                                    key={currentArticles.codeArticle}
                                                    slugArticle={currentArticles.slug}
                                                    tags={currentArticles.tags}
                                                />
                                            )
                                        ))}
                                </>
                            )}
                        </div>

                        <div className="row row-cols-12 g-4 mt-1">
                            <Pagination
                                centrer="true"
                                totalNbElement={articlesFiltered.length}
                                nbElementParPage={nbElementsParPage}
                                numCurrentPageActive={numCurrentPagePaginationActive}
                                setterCurrentNumPageActive={setNumCurrentPagePaginationActive}
                            />
                        </div>

                    </div>
                </div>

                <div className={`${activeGridTags ? "col-12" : "col-3"} ${activeGridTags ? "d-block" : "d-none"} d-lg-block order-1 order-lg-2`}>

                    <div className="input-group mt-2 mb-1 px-3">

                        <span
                            className={`${styles.inputSearch} input-group-text ${styles.shadow}`}
                            id="libelleInputSearchArticles"
                        >
                            @
                        </span>

                        <input
                            type="text"
                            className={`${styles.inputSearch} form-control ${styles.shadow}`}
                            placeholder="Recherche..."
                            aria-label="rechercheArticles"
                            aria-describedby="basic-addon1"

                            onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                                setInputRecherche(e.target.value)
                            }

                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                    setInputRecherche(e.target.value);
                                }
                            }}
                        />
                    </div>

                    <div className="p-3">

                        <div className={`list-group ${styles.shadow}`}>

                            {tagsArticlesActifs?.map((currentTags, index) => (

                                <button
                                    type="button"
                                    key={index}
                                    className={`list-group-item list-group-item-action ${!currentTags.filtreActif ? styles.bandeauTag : styles.bandeauTagFocus}`}
                                    onClick={() => handleClickFilterTagOnOff(currentTags)}
                                >
                                    {currentTags.tag}

                                    <span className="badge pillColorA rounded-pill ms-2 bgcolorA">
                                        {currentTags.nb}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Articles;