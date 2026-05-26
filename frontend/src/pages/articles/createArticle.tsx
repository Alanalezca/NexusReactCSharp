import { useState, useEffect } from "react";
import { useParams, Link as LinkToURL } from "react-router-dom";

import Loader from "../../components/others/Loader";
import { useSessionUserContext } from "../../components/contexts/sessionUserContext";
import { useOngletAlerteContext } from "../../components/contexts/ToastContext";

import styles from "./createArticle.module.css";
import convertDateToDateLong from "../../functions/getDateLong";
import { apiFetch } from "../../api/client";
import TinyEditor from "./tinyMCE";
import useApiFetch from "../../api/useApiFetch";

type ArticleDb = {
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

type TagArticle = {
  codeTagArticle: string;
  libelle: string;
  checked: boolean;
};

type InputForm = {
  codearticle: string;
  titre: string;
  resume: string;
  slug: string;
  contenu: string;
  lienImg: string;
};

const CreateArticle = () => {
  const { slug } = useParams<{ slug: string }>();

  const [loadingArticleAEditer, setLoadingArticleAEditer] = useState(Boolean(slug));
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingValidationCreateArticle, setLoadingValidationCreateArticle] = useState(false);
  const [loadingUploadImage, setLoadingUploadImage] = useState(false);
  const [loadingIsDeletingImg, SetloadingIsDeletingImg] = useState(false);

  const [article, setArticle] = useState<ArticleDb | null>(null);
  const [lienImgCree, setLienImgCree] = useState<string | null>(null);
  const [tags, setTags] = useState<TagArticle[]>([]);
  const [htmlContent, setHtmlContent] = useState("");

  const { sessionUser, loading: loadingSession } = useSessionUserContext();
  const { showOngletAlerte } = useOngletAlerteContext();
  const { callApiFetch } = useApiFetch();

  const [inputForm, setInputForm] = useState<InputForm>({
    codearticle: "",
    titre: "",
    resume: "",
    slug: "",
    contenu: "",
    lienImg: null,
  });

  const btnResetActif = lienImgCree && (lienImgCree == inputForm.lienImg);

  const splitTags = (tagsString?: string | string[]) => {
    if (Array.isArray(tagsString)) return tagsString;

    if (typeof tagsString === "string" && tagsString.trim() !== "") {
      return tagsString.split(",").map((tag) => tag.trim());
    }

    return [];
  };

  const handleChangeTagChecker = (ref: string, value: boolean) => {
    setTags((currentTags) =>
      currentTags.map((tag) =>
        tag.codeTagArticle === ref ? { ...tag, checked: value } : tag
      )
    );
  };

  const handleSetterInputFormFromDB = (currentArticle: ArticleDb) => {
    setInputForm((prev) => ({
      ...prev,
      codearticle: currentArticle.codeArticle,
      titre: currentArticle.titre,
      resume: currentArticle.resume,
      slug: currentArticle.slug,
      contenu: currentArticle.contenu,
      lienImg: currentArticle.lienImg,
    }));

    setHtmlContent(currentArticle.contenu ?? "");
  };

  useEffect(() => {
    if (!slug) {
      setArticle(null);
      setLoadingArticleAEditer(false);
      return;
    }

    if (!sessionUser) {
      setLoadingArticleAEditer(false);
      return;
    }

    const fetchArticle = async () => {
      const viewedKey = `article-viewed-${slug}`;
      const shouldIncrementView = !sessionStorage.getItem(viewedKey);

      const data = await callApiFetch<ArticleDb>(
        `/api/articles/view/${slug}?incrementView=${shouldIncrementView}`,
        "Erreur lors du chargement de l'article",
        setLoadingArticleAEditer
      );

      if (data) {
        const articleModify: ArticleDb = {
          ...data,
          tags: splitTags(data.tags),
        };

        setArticle(articleModify);
        handleSetterInputFormFromDB(articleModify);

        if (shouldIncrementView) {
          sessionStorage.setItem(viewedKey, "true");
        }
      } else {
        setArticle(null);
      }
    };

    fetchArticle();
  }, [slug, sessionUser]);

  useEffect(() => {
    if (!sessionUser) {
      setLoadingTags(false);
      return;
    }

    const callGetAllTags = async () => {
      const data = await callApiFetch<TagArticle[]>(
      "/api/articles/tags",
      "Erreur lors du chargement des tags",
      setLoadingTags
      );

      if (data) {
      setTags(data);
      }
    };

    callGetAllTags();

  }, [sessionUser]);

  useEffect(() => {
    if (!article?.tags) return;

    const articleTags = splitTags(article.tags);

    setTags((currentTags) =>
      currentTags.map((tag) => ({
        ...tag,
        checked: articleTags.includes(tag.libelle),
      }))
    );
  }, [article]);

  const handleEditCurrentArticle = async () => {
    if (!article) return;

    const dateNow = new Date();
    const tagsToInsert = tags.filter((currentTag) => currentTag.checked);

    try {
      await apiFetch("/api/articles/validationMaJ", {
        method: "POST",
        body: JSON.stringify({
          parCodeArticle: article.codeArticle,
          parTitre: inputForm.titre,
          parResume: inputForm.resume,
          parSlug: inputForm.slug,
          parContenu: htmlContent,
          parDateMaj: dateNow,
          parLienImg: inputForm.lienImg,
          parTags: tagsToInsert,
        }),
      });

      showOngletAlerte(
        "success",
        "(Modification article)",
        "",
        `L'article "${inputForm.titre}" a bien été modifié !`
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article :", error);
    }
  };

  const handleCreateNewArticle = async () => {
    if (!sessionUser) return;

    const dateNow = new Date();
    const dateFormated = convertDateToDateLong(dateNow);
    const tagsToInsert = tags.filter((currentTag) => currentTag.checked);

    const createdArticle = await callApiFetch<ArticleDb>(
      "/api/articles/validationCreation",
      "Erreur lors de la création de l'article",
      setLoadingValidationCreateArticle,
      {
        method: "POST",
        body: JSON.stringify({
          codeArticle: `${sessionUser.id}-${dateFormated}`,
          titre: inputForm.titre,
          resume: inputForm.resume,
          slug: inputForm.slug,
          contenu: htmlContent,
          dateCreation: dateNow,
          dateMaj: dateNow,
          creePar: sessionUser.id,
          lienImg: inputForm.lienImg,
          tags: tagsToInsert,
        }),
      }
    );

    if (createdArticle) {
      showOngletAlerte(
        "success",
        "(Création de l'article)",
        "",
        `L'article "${inputForm.titre}" a bien été créé !`
      );
    }
  };

  const handleUploadImage = async (
  event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const result = await callApiFetch<{ imageUrl: string }>(
      "/api/uploads/article-image",
      "Erreur lors de l'upload de l'image",
      setLoadingUploadImage,
      {
        method: "POST",
        body: formData,
      }
    );

    if (result) {
      setInputForm((prev) => ({
        ...prev,
        lienImg: result.imageUrl,
      }));
      setLienImgCree(result.imageUrl);
    }
  };

  const handleResetImage = async () => {
    if (!inputForm.lienImg) return;

    const fileName = lienImgCree.split("/").pop();
    await callApiFetch(
      `/api/uploads/article-image/${encodeURIComponent(fileName)}`,
      "Erreur lors de la suppression de l'image",
      SetloadingIsDeletingImg,
      {
        method: "DELETE",
      }
    );

    setInputForm((prev) => ({
      ...prev,
      lienImg: "",
    }));
  };

  const isLoading = loadingSession || loadingArticleAEditer || loadingTags;

  return (
    <div className="container-xl mt-4">
      {isLoading ? (
        <Loader />
      ) : sessionUser?.grade === "Administrateur" ? (
        <div className="row">
          <div className="col-12 col-lg-12">
            <h2 className="mt-4 text-center txtColorWhite">
              {article ? "Éditer un " : "Créer un nouvel "}article
            </h2>

            <input
              className={`mt-4 ${styles.input}`}
              type="text"
              maxLength={45}
              placeholder="Titre"
              value={inputForm.titre}
              onChange={(e) =>
                setInputForm((prev) => ({ ...prev, titre: e.target.value }))
              }
            />

            <input
              className={`mt-2 ${styles.input}`}
              type="text"
              maxLength={30}
              placeholder="Slug"
              value={inputForm.slug}
              onChange={(e) =>
                setInputForm((prev) => ({ ...prev, slug: e.target.value }))
              }
            />

            <div className="d-flex align-items-center gap-2">
              <input
                className={`mt-2 ${styles.input}`}
                type="text"
                maxLength={80}
                placeholder="Lien image de l'article"
                value={inputForm.lienImg}
                onChange={(e) =>
                  setInputForm((prev) => ({ ...prev, lienImg: e.target.value }))
                }
              />
              
              <button
                type="button"
                className={`${styles.resetImageButton} mt-2`}
                disabled={!btnResetActif}
                onClick={handleResetImage}
              >
                Reset
              </button>
              <label className={`mt-2 ${styles.customUploadButton}`}>
                Uploader
                <input
                className={styles.inputAsButton}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  hidden
                />
              </label>
            </div>

            <textarea
              className={`mt-2 mb-2 ${styles.input}`}
              maxLength={300}
              placeholder="Résumé de l'article"
              value={inputForm.resume}
              onChange={(e) =>
                setInputForm((prev) => ({ ...prev, resume: e.target.value }))
              }
              rows={5}
            />

            <div className="col-12 mb-2 d-flex flex-wrap align-items-start justify-content-start txtColorWhite">
              <span className="ps-1">
                <b>Tags : </b>
              </span>

              {tags.map((currentTag) => (
                <div
                  className="ps-2"
                  key={currentTag.codeTagArticle}
                  onClick={() =>
                    handleChangeTagChecker(
                      currentTag.codeTagArticle,
                      !currentTag.checked
                    )
                  }
                >
                  <span
                    className={`badge ${
                      currentTag.checked ? "badge-customOn" : "badge-customOff"
                    } cPointer`}
                  >
                    {currentTag.libelle}
                  </span>
                </div>
              ))}
            </div>

            <div className={`${styles.breakerTitre} mt-4 mb-4`}></div>

            <TinyEditor value={htmlContent} onChange={setHtmlContent} />

            {!article ? (
              <button
                disabled={loadingValidationCreateArticle}
                className="mb-5"
                type="button"
                onClick={handleCreateNewArticle}
                style={{ marginTop: "1em" }}
              >
                Sauvegarder l’article
              </button>
            ) : (
              <>
                <button
                  className="mb-5"
                  type="button"
                  onClick={handleEditCurrentArticle}
                  style={{ marginTop: "1em" }}
                >
                  Mettre à jour l'article
                </button>

                <LinkToURL to={`/article/${slug}`}>
                  <button
                    className="mb-5 ms-3"
                    type="button"
                    style={{ marginTop: "1em" }}
                  >
                    Consulter l'article
                  </button>
                </LinkToURL>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12 col-lg-12 mt-5">
            <h2 className="mt-5 text-center txtColorWhite">
              La création/édition d'article est réservée aux administrateurs
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateArticle;
