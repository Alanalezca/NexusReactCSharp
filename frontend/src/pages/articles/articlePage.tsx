import styles from './articlePage.module.css';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

import { useSessionUserContext } from '../../components/contexts/sessionUserContext';
import { useOngletAlerteContext } from '../../components/contexts/ToastContext';

import { handleDeleteArticle } from '../../functions/callAPIx/articleDelete';
import { handleReversePublished } from '../../functions/callAPIx/articleReversePublish';

import Loader from '../../components/others/Loader';
import useApiFetch from "../../api/useApiFetch";
import { getImageUrl } from "../../functions/helpers/getImageUrl";

type ArticleView = {
  codeArticle: string;
  titre: string;
  resume?: string;
  slug: string;
  contenu: string;
  dateCreation?: string;
  dateMaj?: string;
  creePar?: number;
  pseudoCreateur?: string;
  lienImg?: string;
  tags?: string | string[];
  publie?: boolean;
  nbVues?: number;
};

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();

  const [article, setArticle] = useState<ArticleView | null>(null);
  const [articleNotExist, setArticleNotExist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');
  const [forceRefresh, setForceRefresh] = useState(0);

  const { sessionUser } = useSessionUserContext();
  const { showOngletAlerte } = useOngletAlerteContext();
  const { callApiFetch } = useApiFetch();

  const splitTags = (tags: string | string[] | undefined): string[] => {
    if (Array.isArray(tags)) {
      return tags;
    }

    if (typeof tags === 'string' && tags.trim() !== '') {
      return tags.split(',').map((tag) => tag.trim());
    }

    return [];
  };

  const rewriteHtmlImageUrls = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src");

      if (!src) return;

      img.setAttribute("src", getImageUrl(src));
    });

    return doc.body.innerHTML;
  };

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      const viewedKey = `article-viewed-${slug}`;
      const shouldIncrementView = !sessionStorage.getItem(viewedKey);

      const data = await callApiFetch<ArticleView>(
        `/api/articles/view/${slug}?incrementView=${shouldIncrementView}`,
        "Erreur lors du chargement de l'article",
        setIsLoading
      );

      if (data) {
        const articleModify: ArticleView = {
          ...data,
          tags: splitTags(data.tags),
        };

        setArticle(articleModify);
        setArticleNotExist(false);

        if (shouldIncrementView) {
          sessionStorage.setItem(viewedKey, "true");
        }
      } else {
        setArticle(null);
        setArticleNotExist(true);
      }
    };

    fetchArticle();
  }, [slug, forceRefresh]);

  useEffect(() => {
    if (!article?.contenu) {
      setSanitizedHtml("");
      return;
    }

    const htmlWithFixedImages = rewriteHtmlImageUrls(article.contenu);

    setSanitizedHtml(
      DOMPurify.sanitize(htmlWithFixedImages, {
        ADD_TAGS: ["div"],
        ADD_ATTR: ["class"],
      })
    );
  }, [article]);

  const handleTogglePublication = () => {
    if (!article) return;

    handleReversePublished(
      article.codeArticle,
      article.titre,
      article.publie,
      showOngletAlerte,
      null
    );

    setArticle((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        publie: !prev.publie,
      };
    });
  };

  return (
    <div className="article">
      {isLoading && <Loader />}

      {article && (
        <>
          <div className="container-xl mt-5">
            <div className="row">
              <div
                className={`col-12 col-lg-10 offset-lg-1 p-0 bgcolorC ${styles.cadreTitre} ${styles.shadow}`}
              >
                <img
                  src={getImageUrl(article.lienImg)}
                  alt={article.titre}
                  className={styles.articleImage}
                />

                <h2 className="mt-4 text-center txtColorWhite">
                  {article.titre}
                </h2>

                <div className="row mt-4">
                  <div className="col-12 col-lg-4 d-flex align-items-center justify-content-center">
                    <i className="bx bx-user-circle bx-sm bxNormalColorE"></i>
                    <span className="ps-1">
                      <b>Article créé par : </b>
                    </span>
                    <span className="ps-1 txtColorWhite">
                      {article.pseudoCreateur}
                    </span>
                  </div>

                  <div className="col-12 col-lg-4 d-flex align-items-center justify-content-center">
                    <i className="bx bx-calendar-alt bx-sm bxNormalColorE"></i>
                    <span className="ps-1">
                      <b>Créé le : </b>
                    </span>
                    <span className="ps-1 txtColorWhite">
                      {article.dateCreation
                        ? new Date(article.dateCreation).toLocaleDateString('fr-FR')
                        : ''}
                    </span>
                  </div>

                  <div className="col-12 col-lg-4 d-flex align-items-center justify-content-center">
                    <i className="bx bx-calendar-edit bx-sm bxNormalColorE"></i>
                    <span className="ps-1">
                      <b>Édité le : </b>
                    </span>
                    <span className="ps-1 txtColorWhite">
                      {article.dateMaj
                        ? new Date(article.dateMaj).toLocaleDateString('fr-FR')
                        : ''}
                    </span>
                  </div>
                </div>

                <div className="row mt-2 mb-3">
                  <div className="col-12 d-flex align-items-center justify-content-center">
                    <i className="bx bx-book-reader bx-sm bxNormalColorE"></i>
                    <span className="ps-1">
                      <b>Vues : </b>
                    </span>
                    <span className="ps-1 me-2 txtColorWhite">
                      {article.nbVues ?? 0}
                    </span>

                    <i className="bx bx-purchase-tag-alt bx-sm bxNormalColorE"></i>
                    <span className="ps-1">
                      <b>Tags : </b>
                    </span>

                    {Array.isArray(article.tags) &&
                      article.tags.map((currentTag, index) => (
                        <div className="ps-2" key={`tag-${index}`}>
                          <span className="badge badge-custom">{currentTag}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="mb-5 col-12 col-lg-10 offset-lg-1 txtColorWhite">
                {sessionUser?.grade === 'Administrateur' && (
                  <div className={styles.ancrageOverlayCommandesAdmin}>
                    <div className={styles.overlayCommandesAdmin}>
                      <Link to={`/article/create/${article.slug}`}>
                        <i className="bx bx-edit bxNormalOrange cPointer"></i>
                      </Link>

                      <i
                        className="bx bx-trash bxNormalOrangeToRed ps-1 cPointer"
                        onClick={() =>
                          handleDeleteArticle(
                            article.codeArticle,
                            article.titre,
                            showOngletAlerte,
                            setForceRefresh
                          )
                        }
                      ></i>

                      {article.publie ? (
                        <i
                          className="bx bxs-cloud bxEnabledToDisabled topMinus3 cPointer"
                          onClick={handleTogglePublication}
                        ></i>
                      ) : (
                        <i
                          className="bx bxs-cloud-upload bxDisabledToEnabled topMinus3 cPointer"
                          onClick={handleTogglePublication}
                        ></i>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-4 ${styles.articleInsered} txt-base blocArticleShow`}
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              </div>
            </div>
          </div>

          <div
            id={styles.btnGoTop}
            className="btn-ColorA"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <i className="bx bxs-up-arrow bx-sm"></i>
          </div>
        </>
      )}

      {articleNotExist && !isLoading && (
        <div className="container-xl mt-5">
          <div className="row d-flex align-items-center">
            <div className="col-12 mt-3 text-center">
              <p>Aucun article disponible</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlePage;