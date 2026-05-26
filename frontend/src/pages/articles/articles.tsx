import Card from '../../components/others/Card';
import CardLarge from '../../components/others/CardLarge';
import CardLoading from '../../components/others/CardLoading';
import CardLargeLoading from '../../components/others/CardLargeLoading';
import Pagination from '../../components/others/Pagination';
import styles from './articles.module.css';
import { useState, useEffect } from 'react';
import { useArticlesFilters } from './useArticlesFilters';
import { getImageUrl } from "../../functions/helpers/getImageUrl";

const NB_ELEMENTS_PAR_PAGE = 10;

const Articles = () => {
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [activeGridTags, setActiveGridTag] = useState(false);
    const [numCurrentPagePaginationActive, setNumCurrentPagePaginationActive] = useState(1);

    const {
        isLoading,
        articlesFiltered,
        tagsArticlesActifs,
        updateSearch,
        toggleTagFilter
    } = useArticlesFilters();

    const indiceFirstArticlePartA =
        (NB_ELEMENTS_PAR_PAGE * numCurrentPagePaginationActive) - NB_ELEMENTS_PAR_PAGE;

    const indiceLastArticlePartA = indiceFirstArticlePartA + 3;
    const indiceFirstArticlePartB = indiceLastArticlePartA;
    const indiceLastArticlePartB = indiceFirstArticlePartA + NB_ELEMENTS_PAR_PAGE;

    const articlesPartA = articlesFiltered.slice(
        indiceFirstArticlePartA,
        indiceLastArticlePartA
    );

    const articlesPartB = articlesFiltered.slice(
        indiceFirstArticlePartB,
        indiceLastArticlePartB
    );

    useEffect(() => {
        const checkScreenSize = () => setIsLargeScreen(window.innerWidth >= 992);

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        setNumCurrentPagePaginationActive(1);
    }, [articlesFiltered.length]);

    const handleSearch = (value: string) => {
        updateSearch(value);
        setNumCurrentPagePaginationActive(1);
    };

    const handleToggleTag = (tag: string) => {
        toggleTagFilter(tag);
        setNumCurrentPagePaginationActive(1);
    };

    return (
        <div className="container-xl mt-4">
            <div className="row">

                {!isLargeScreen && (
                    <div className="d-flex justify-content-end">
                        <i
                            className={`bx bx-filter ${activeGridTags ? "bxNormalGrey" : "bxNormalOrange"}`}
                            onClick={() => setActiveGridTag(prev => !prev)}
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
                                    {articlesFiltered.length === 0 && (
                                        <h2 className="mt-4 text-center txtColorWhite">
                                            Aucun article ne correspond à vos critères
                                        </h2>
                                    )}

                                    {articlesPartA.map(currentArticle => (
                                        <Card
                                            key={currentArticle.codeArticle}
                                            tailleCol={isLargeScreen ? 4 : 12}
                                            classCSSColorBackground="bgcolorC"
                                            cheminImg={getImageUrl(currentArticle.lienImg)}
                                            classCSSColorTxtTitre="txtColorA"
                                            titre={currentArticle.titre}
                                            classCSSColorTxtContenu="txtColorWhite"
                                            texteContenu={
                                                currentArticle.resume?.length >= 170
                                                    ? currentArticle.resume.substring(0, 170) + "..."
                                                    : currentArticle.resume
                                            }
                                            classCSSColorTxtBottom="txtColorD"
                                            texteBottom={
                                                currentArticle.dateCreation > currentArticle.dateMaj
                                                    ? new Date(currentArticle.dateCreation).toLocaleDateString('fr-FR')
                                                    : new Date(currentArticle.dateMaj).toLocaleDateString('fr-FR')
                                            }
                                            slugArticle={currentArticle.slug}
                                            tags={currentArticle.tags}
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
                                    {articlesPartB.map(currentArticle => (
                                        isLargeScreen ? (
                                            <CardLarge
                                                key={currentArticle.codeArticle}
                                                classCSSColorBackground="bgcolorC"
                                                cheminImg={getImageUrl(currentArticle.lienImg)}
                                                classCSSColorTxtTitre="txtColorA"
                                                titre={currentArticle.titre}
                                                classCSSColorTxtContenu="txtColorWhite"
                                                texteContenu={
                                                    currentArticle.resume?.length >= 270
                                                        ? currentArticle.resume.substring(0, 270) + "..."
                                                        : currentArticle.resume
                                                }
                                                classCSSColorTxtBottom="txtColorD"
                                                texteBottom={
                                                    currentArticle.dateCreation > currentArticle.dateMaj
                                                        ? new Date(currentArticle.dateCreation).toLocaleDateString('fr-FR')
                                                        : new Date(currentArticle.dateMaj).toLocaleDateString('fr-FR')
                                                }
                                                slugArticle={currentArticle.slug}
                                                tags={currentArticle.tags}
                                            />
                                        ) : (
                                            <Card
                                                key={currentArticle.codeArticle}
                                                classCSSColorBackground="bgcolorC"
                                                cheminImg={currentArticle.lienImg}
                                                classCSSColorTxtTitre="txtColorA"
                                                titre={currentArticle.titre}
                                                classCSSColorTxtContenu="txtColorWhite"
                                                texteContenu={
                                                    currentArticle.resume?.length >= 170
                                                        ? currentArticle.resume.substring(0, 170) + "..."
                                                        : currentArticle.resume
                                                }
                                                classCSSColorTxtBottom="txtColorD"
                                                texteBottom={
                                                    currentArticle.dateCreation > currentArticle.dateMaj
                                                        ? new Date(currentArticle.dateCreation).toLocaleDateString('fr-FR')
                                                        : new Date(currentArticle.dateMaj).toLocaleDateString('fr-FR')
                                                }
                                                slugArticle={currentArticle.slug}
                                                tags={currentArticle.tags}
                                            />
                                        )
                                    ))}
                                </>
                            )}
                        </div>

                        <div className="row row-cols-12 g-4 mt-1">
                            <Pagination
                                centrer={true}
                                totalNbElement={articlesFiltered.length}
                                nbElementParPage={NB_ELEMENTS_PAR_PAGE}
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
                            aria-describedby="libelleInputSearchArticles"
                            onBlur={(e) => handleSearch(e.currentTarget.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch(e.currentTarget.value);
                                }
                            }}
                        />
                    </div>

                    <div className="p-3">
                        <div className={`list-group ${styles.shadow}`}>
                            {tagsArticlesActifs.map(currentTag => (
                                <button
                                    type="button"
                                    key={currentTag.tag}
                                    className={`list-group-item list-group-item-action ${
                                        !currentTag.filtreActif
                                            ? styles.bandeauTag
                                            : styles.bandeauTagFocus
                                    }`}
                                    onClick={() => handleToggleTag(currentTag.tag)}
                                >
                                    {currentTag.tag}

                                    <span className="badge pillColorA rounded-pill ms-2 bgcolorA">
                                        {currentTag.nb}
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