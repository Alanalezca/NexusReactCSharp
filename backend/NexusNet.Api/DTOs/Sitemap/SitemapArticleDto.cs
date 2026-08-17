namespace NexusNet.Api.Models.DTO
{
    public class SitemapArticleDto
    {
        public string Titre { get; set; } = string.Empty;
        public string Resume { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public DateTime DateMaj { get; set; }
        public string? LienImg { get; set; }
    }
}