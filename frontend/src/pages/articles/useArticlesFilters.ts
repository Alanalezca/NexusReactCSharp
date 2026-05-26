import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client";

type Article = {
    codeArticle: string;
    titre?: string;
    resume?: string;
    tags?: string;
    lienImg?: string;
    dateCreation?: string;
    dateMaj?: string;
    slug?: string;
};

type TagArticle = {
    tag: string;
    nb: number;
    filtreActif: boolean;
};

const normalizeText = (value?: string) =>
    (value || "").trim().toLowerCase();

const splitTags = (tagsString?: string) => {
    if (!tagsString || tagsString.trim() === "") {
        return [];
    }

    return tagsString
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);
};

export function useArticlesFilters() {
    const [isLoading, setIsLoading] = useState(true);
    const [articles, setArticles] = useState<Article[]>([]);
    const [inputRecherche, setInputRecherche] = useState("");
    const [tagsSelectForFilter, setTagsSelectForFilter] = useState<string[]>([]);

    useEffect(() => {

        const fetchArticles = async () => {
            try {
                const data = await apiFetch<Article[]>("/api/articles", {
                    method: "GET"
                });

                setArticles(data);
            }
            catch(error) {
                console.error("Erreur fetch articles:", error);
            }
            finally {
                setIsLoading(false);
            }
        };

        fetchArticles();

    }, []);

    const tagsArticlesActifs = useMemo<TagArticle[]>(() => {
        const allTags = articles.flatMap(article => splitTags(article.tags));

        const tagsWithCount = allTags.reduce<Record<string, number>>((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(tagsWithCount).map(([tag, nb]) => ({
            tag,
            nb,
            filtreActif: tagsSelectForFilter.includes(tag)
        }));
    }, [articles, tagsSelectForFilter]);

    const articlesFiltered = useMemo(() => {
        const cleanInputSearch = normalizeText(inputRecherche);

        return articles.filter(article => {
            const articleTagsArray = splitTags(article.tags).map(normalizeText);

            const titre = normalizeText(article.titre);
            const resume = normalizeText(article.resume);

            const matchRecherche =
                cleanInputSearch === "" ||
                titre.includes(cleanInputSearch) ||
                resume.includes(cleanInputSearch);

            const matchTags =
                tagsSelectForFilter.length === 0 ||
                tagsSelectForFilter.every(currentTag =>
                    articleTagsArray.includes(normalizeText(currentTag))
                );

            return matchRecherche && matchTags;
        });
    }, [articles, tagsSelectForFilter, inputRecherche]);

    const toggleTagFilter = (tag: string) => {
        setTagsSelectForFilter(prev =>
            prev.includes(tag)
                ? prev.filter(currentTag => currentTag !== tag)
                : [...prev, tag]
        );
    };

    const updateSearch = (value: string) => {
        setInputRecherche(normalizeText(value));
    };

    return {
        isLoading,
        articles,
        articlesFiltered,
        inputRecherche,
        updateSearch,
        tagsArticlesActifs,
        tagsSelectForFilter,
        toggleTagFilter
    };
}