import { apiFetch } from "../../api/client";

type ShowAlerteType = (
    type: string,
    titre: string,
    sousTitre: string,
    message: string
) => void;

type SetRefresherType = React.Dispatch<React.SetStateAction<number>>;

type ArticleAdmin = {
    codeArticle: string;
    titre: string;
    publie: boolean;
};

export const handleReversePublished = async (
    codeArticle: string,
    titreArticle: string,
    articlePublieOuiNon: boolean,
    showAlerte: ShowAlerteType,
    setRefresher?: SetRefresherType
): Promise<void> => {
    try {
        await apiFetch<ArticleAdmin>(`/api/articles/reverse-publish/${codeArticle}`, {
            method: "PATCH"
        });

        showAlerte(
            "success",
            "(Publication article)",
            "",
            `L'article "${titreArticle}" a bien été ${articlePublieOuiNon ? "dépublié." : "publié."}`
        );

        setRefresher?.(prev => prev + 1);
    }
    catch (error) {
        console.error("Erreur lors de l'update du publish de l'article :", error);

        showAlerte(
            "error",
            "(Erreur publication)",
            "",
            `Impossible de modifier la publication de l'article "${titreArticle}".`
        );
    }
};
