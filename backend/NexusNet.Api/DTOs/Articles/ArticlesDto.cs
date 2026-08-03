namespace NexusNet.Api.DTOs.Articles;

public class ArticlesDto
{
    public string? CodeArticle { get; set; }
    public string? Titre { get; set; }
    public string? Resume { get; set; }
    public string? Slug { get; set; }
    public string? Contenu { get; set; }
    public DateTime? DateCreation { get; set; }
    public DateTime? DateMaj { get; set; }
    public int? CreePar { get; set; }
    public string? PseudoCreateur { get; set; }
    public string? LienImg { get; set; }
    public string? Tags { get; set; }
}

public class ArticleViewDto
{
    public string? CodeArticle { get; set; }
    public string? Titre { get; set; }
    public string? Resume { get; set; }
    public string? Slug { get; set; }
    public string? Contenu { get; set; }
    public DateTime? DateCreation { get; set; }
    public DateTime? DateMaj { get; set; }
    public int? CreePar { get; set; }
    public string? PseudoCreateur { get; set; }
    public string? LienImg { get; set; }
    public string? Tags { get; set; }

    public int? NbVues { get; set; }
}


public class TagsArticlesDto
{
    public string? CodeTagArticle { get; set; }
    public string? Libelle { get; set; }
}