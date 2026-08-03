using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusNet.Api.DTOs.Images;

namespace NexusNet.Api.Controllers;

[ApiController]
[Route("api/uploads")]
public class UploadsController : ControllerBase
{
    [Authorize(Policy = "Admin")]
    [HttpPost("article-image")]
    public async Task<IActionResult> UploadArticleImage(
        IFormFile image,
        [FromForm] string slug
    )
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest(new { message = "Aucune image reçue." });
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest(new { message = "Slug manquant." });
        }

        var allowedExtensions = new[]
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Format non autorisé." });
        }

        var safeSlug = slug
            .Trim()
            .ToLowerInvariant()
            .Replace(" ", "-");

        var fileName = $"{Guid.NewGuid()}${safeSlug}{extension}";

        var uploadFolder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "images",
            "articles"
        );

        Directory.CreateDirectory(uploadFolder);

        var filePath = Path.Combine(uploadFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        var imageUrl = $"/images/articles/{fileName}";

        return Ok(new { imageUrl });
    }

    [Authorize(Policy = "Admin")]
    [HttpDelete("article-image/{fileName}")]
    public IActionResult DeleteArticleImage(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return BadRequest(new { message = "Nom de fichier manquant." });
        }

        var safeFileName = Path.GetFileName(fileName);

        if (safeFileName != fileName)
        {
            return BadRequest(new { message = "Nom de fichier invalide." });
        }

        var uploadFolder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "images",
            "articles"
        );

        var filePath = Path.Combine(uploadFolder, safeFileName);

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { message = "Image introuvable." });
        }

        System.IO.File.Delete(filePath);

        return Ok(new { message = "Image supprimée avec succès." });
    }

    [Authorize(Policy = "Admin")]
    [HttpGet("article-images")]
    public IActionResult GetArticleImages()
    {
        var uploadFolder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "images",
            "articles"
        );

        if (!Directory.Exists(uploadFolder))
        {
            return Ok(new List<ImageDto>());
        }

        var allowedExtensions = new[]
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        var images = Directory
            .GetFiles(uploadFolder)
            .Where(filePath =>
                allowedExtensions.Contains(
                    Path.GetExtension(filePath).ToLowerInvariant()
                )
            )
            .Select(filePath =>
            {
                var fileInfo = new FileInfo(filePath);
                var fileName = fileInfo.Name;

                return new ImageDto
                {
                    FileName = fileName,
                    Url = $"/images/articles/{fileName}",
                    Extension = fileInfo.Extension,
                    SizeBytes = fileInfo.Length,
                    CreatedAt = fileInfo.CreationTimeUtc
                };
            })
            .OrderByDescending(image => image.CreatedAt)
            .ToList();

        return Ok(images);
    }
}