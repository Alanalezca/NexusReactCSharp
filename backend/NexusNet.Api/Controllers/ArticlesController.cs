using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusNet.Api.DTOs.Articles;
using NexusNet.Api.Services.Articles;

namespace NexusNet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly IArticlesService _articlesService;

    public ArticlesController(IArticlesService articlesService)
    {
        _articlesService = articlesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetArticles()
    {
        var articles = await _articlesService.GetPublishedArticlesAsync();
        return Ok(articles);
    }

    [Authorize(Policy = "Admin")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllArticles()
    {
        var articles = await _articlesService.GetAllArticlesAsync();
        return Ok(articles);
    }

    [Authorize(Policy = "Admin")]
    [HttpDelete("delete/{codeArticle}")]
    public async Task<IActionResult> DeleteArticle(string codeArticle)
    {
        var deletedArticle = await _articlesService.DeleteArticleAsync(codeArticle);

        if (deletedArticle == null)
        {
            return NotFound(new { error = "Article introuvable" });
        }

        return Ok(deletedArticle);
    }

    [Authorize(Policy = "Admin")]
    [HttpPatch("reverse-publish/{codeArticle}")]
    public async Task<IActionResult> ReversePublishArticle(string codeArticle)
    {
        var updatedArticle = await _articlesService.ReversePublishArticleAsync(codeArticle);

        if (updatedArticle == null)
        {
            return NotFound(new { error = "Article introuvable ou modification échouée" });
        }

        return Ok(updatedArticle);
    }

    [HttpGet("view/{slug}")]
    public async Task<IActionResult> GetArticleBySlug(
        string slug,
        [FromQuery] bool incrementView = true
    )
    {
        var article = await _articlesService.GetArticleBySlugAsync(slug, incrementView);

        if (article == null)
        {
            return NotFound(new { error = "Article non trouvé" });
        }

        return Ok(article);
    }

    [HttpGet("tags")]
    public async Task<IActionResult> GetTagsArticles()
    {
        var tags = await _articlesService.GetAllTagsAsync();

        return Ok(tags);
    }

    [Authorize(Policy = "Admin")]
    [HttpPost("validationCreation")]
    public async Task<IActionResult> CreateArticle([FromBody] CreateArticleDto dto)
    {
        var createdArticle = await _articlesService.CreateArticleAsync(dto);

        if (createdArticle == null)
        {
            return Conflict(new { error = "Un article utilise déjà ce slug" });
        }

        return CreatedAtAction(
            nameof(GetArticleBySlug),
            new { slug = createdArticle.Slug },
            createdArticle
        );
    }

    [Authorize(Policy = "Admin")]
    [HttpPatch("validationUpdate")]
    public async Task<IActionResult> UpdateArticle([FromBody] UpdateArticleDto dto)
    {
        var updatedArticle = await _articlesService.UpdateArticleAsync(dto);

        if (updatedArticle == null)
        {
            return NotFound(new { error = "Article introuvable ou slug déjà utilisé" });
        }

        return Ok(updatedArticle);
    }
}
