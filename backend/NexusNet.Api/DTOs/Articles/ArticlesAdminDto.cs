namespace NexusNet.Api.DTOs.Articles;

public class ArticlesAdminDto
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
    public bool? Publie { get; set; }
}


public class CreateArticleDto
{
    public string? CodeArticle { get; set; }
    public string? Titre { get; set; }
    public string? Resume { get; set; }
    public string? Slug { get; set; }
    public string? Contenu { get; set; }
    public DateTime? DateCreation { get; set; }
    public DateTime? DateMaj { get; set; }
    public int CreePar { get; set; }
    public string? LienImg { get; set; }
    public List<ArticleTagDto> Tags { get; set; } = new();
}

public class ArticleTagDto
{
    public string? CodeTagArticle { get; set; }
}

public class UpdateArticleDto
{
    public string? ParCodeArticle { get; set; }
    public string? ParTitre { get; set; }
    public string? ParResume { get; set; }
    public string? ParSlug { get; set; }
    public string? ParContenu { get; set; }
    public DateTime? ParDateMaj { get; set; }
    public string? ParLienImg { get; set; }
    public List<ArticleTagDto> ParTags { get; set; } = new();
}