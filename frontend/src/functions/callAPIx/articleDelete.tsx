import { apiFetch } from "../../api/client";

type ShowAlerteType = (
    type: string,
    titre: string,
    sousTitre: string,
    message: string
) => void;

type SetRefresherType = React.Dispatch<React.SetStateAction<number>>;

export const handleDeleteArticle = async (
    codeArticle: string,
    titreArticle: string,
    showAlerte: ShowAlerteType,
    setRefresher: SetRefresherType
): Promise<void> => {

    try {

        await apiFetch(`/api/articles/delete/${codeArticle}`, {
            method: "DELETE"
        });

        showAlerte(
            "success",
            "(Suppression article)",
            "",
            `L'article "${titreArticle}" a bien été supprimé.`
        );

        setRefresher(prev => prev + 1);

    } 
    catch (error) {

        console.error(
            "Erreur lors de la suppression de l'article :",
            error
        );

        showAlerte(
            "error",
            "(Erreur suppression)",
            "",
            `Impossible de supprimer l'article "${titreArticle}".`
        );
    }
};
