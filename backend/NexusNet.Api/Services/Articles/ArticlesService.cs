using NexusNet.Api.DTOs.Articles;
using NexusNet.Api.Repositories.Articles;

namespace NexusNet.Api.Services.Articles;

public interface IArticlesService
{
    Task<List<ArticlesDto>> GetPublishedArticlesAsync();
    Task<List<ArticlesAdminDto>> GetAllArticlesAsync();
    Task<ArticlesAdminDto?> DeleteArticleAsync(string codeArticle);
    Task<ArticlesAdminDto?> ReversePublishArticleAsync(string codeArticle);
    Task<ArticleViewDto?> GetArticleBySlugAsync(string slug, bool incrementView);
    Task<List<TagsArticlesDto>> GetAllTagsAsync();
    Task<ArticlesAdminDto?> CreateArticleAsync(CreateArticleDto dto);

    Task<ArticlesAdminDto?> UpdateArticleAsync(UpdateArticleDto dto);
}

public class ArticlesService : IArticlesService
{
    private readonly IArticlesRepository _articlesRepository;

    public ArticlesService(IArticlesRepository articlesRepository)
    {
        _articlesRepository = articlesRepository;
    }

    public Task<List<ArticlesDto>> GetPublishedArticlesAsync()
    {
        return _articlesRepository.GetPublishedArticlesAsync();
    }

    public Task<List<ArticlesAdminDto>> GetAllArticlesAsync()
    {
        return _articlesRepository.GetAllArticlesAsync();
    }

    public Task<ArticlesAdminDto?> DeleteArticleAsync(string codeArticle)
    {
        return _articlesRepository.DeleteArticleAsync(codeArticle);
    }

    public Task<ArticlesAdminDto?> ReversePublishArticleAsync(string codeArticle)
    {
        return _articlesRepository.ReversePublishArticleAsync(codeArticle);
    }

    public Task<ArticleViewDto?> GetArticleBySlugAsync(string slug, bool incrementView)
    {
        return _articlesRepository.GetArticleBySlugAsync(slug, incrementView);
    }
    public Task<List<TagsArticlesDto>> GetAllTagsAsync()
    {
        return _articlesRepository.GetAllTagsAsync();
    }

    public Task<ArticlesAdminDto?> CreateArticleAsync(CreateArticleDto dto)
    {
        return _articlesRepository.CreateArticleAsync(dto);
    }

    public Task<ArticlesAdminDto?> UpdateArticleAsync(UpdateArticleDto dto)
    {
        return _articlesRepository.UpdateArticleAsync(dto);
    }
}