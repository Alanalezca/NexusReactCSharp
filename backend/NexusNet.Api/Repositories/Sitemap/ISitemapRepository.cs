using Npgsql;
using NexusNet.Api.Models.DTO;

namespace NexusNet.Api.Repositories.Sitemap
{
    public interface ISitemapRepository
    {
        Task<List<SitemapArticleDto>> GetPublishedArticlesAsync();
    }

    public class SitemapRepository : ISitemapRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public SitemapRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<List<SitemapArticleDto>> GetPublishedArticlesAsync()
        {
            var articles = new List<SitemapArticleDto>();

            const string sql = """
                SELECT
                    "Titre",
                    "Resume",
                    "Slug",
                    "DateMaj",
                    "LienImg"
                FROM tab_articles
                WHERE "Publie" = TRUE
                  AND "Slug" IS NOT NULL
                  AND "Slug" <> ''
                ORDER BY "DateMaj" DESC;
                """;

            await using var command = _dataSource.CreateCommand(sql);
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                articles.Add(new SitemapArticleDto
                {
                    Titre = reader.GetString(reader.GetOrdinal("Titre")),
                    Resume = reader.GetString(reader.GetOrdinal("Resume")),
                    Slug = reader.GetString(reader.GetOrdinal("Slug")),
                    DateMaj = reader.GetDateTime(reader.GetOrdinal("DateMaj")),
                    LienImg = reader.IsDBNull(reader.GetOrdinal("LienImg"))
                        ? null
                        : reader.GetString(reader.GetOrdinal("LienImg"))
                });
            }

            return articles;
        }
    }
}