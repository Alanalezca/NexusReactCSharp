using Microsoft.EntityFrameworkCore;
using NexusNet.Api.Data;
using NexusNet.Api.DTOs.Articles;

namespace NexusNet.Api.Repositories.Articles;

public interface IArticlesRepository
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

public class ArticlesRepository : IArticlesRepository
{
    private readonly AppDbContext _db;

    public ArticlesRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ArticlesDto>> GetPublishedArticlesAsync()
    {
        return await _db.Database
            .SqlQueryRaw<ArticlesDto>(@"
                SELECT 
                    a.""CodeArticle"",
                    a.""Titre"",
                    a.""Resume"",
                    a.""Slug"",
                    a.""Contenu"",
                    a.""DateCreation"",
                    a.""DateMaj"",
                    a.""CreePar"",
                    u.""pseudo"" AS ""PseudoCreateur"",
                    a.""LienImg"",
                    STRING_AGG(t.""Libelle"", ',') AS ""Tags""
                FROM tab_articles a
                INNER JOIN tab_users u
                    ON a.""CreePar"" = u.id
                LEFT JOIN tab_affectations_tags_articles ata
                    ON ata.""CodeArticle"" = a.""CodeArticle""
                LEFT JOIN l_tags_articles t
                    ON ata.""CodeTagArticle"" = t.""CodeTagArticle""
                WHERE COALESCE(a.""Publie"", false) = true
                GROUP BY 
                    a.""CodeArticle"",
                    a.""Titre"",
                    a.""Resume"",
                    a.""Slug"",
                    a.""Contenu"",
                    a.""DateCreation"",
                    a.""DateMaj"",
                    a.""CreePar"",
                    u.""pseudo"",
                    a.""LienImg""
                ORDER BY a.""DateCreation"" DESC
            ")
            .ToListAsync();
    }

    public async Task<List<ArticlesAdminDto>> GetAllArticlesAsync()
    {
        return await _db.Database
            .SqlQueryRaw<ArticlesAdminDto>(@"
                SELECT 
                    a.""CodeArticle"",
                    a.""Titre"",
                    a.""Resume"",
                    a.""Slug"",
                    a.""Contenu"",
                    a.""DateCreation"",
                    a.""DateMaj"",
                    a.""CreePar"",
                    u.""pseudo"" AS ""PseudoCreateur"",
                    a.""LienImg"",
                    STRING_AGG(t.""Libelle"", ',') AS ""Tags"",
                    a.""Publie"" AS ""Publie""
                FROM tab_articles a
                INNER JOIN tab_users u
                    ON a.""CreePar"" = u.id
                LEFT JOIN tab_affectations_tags_articles ata
                    ON ata.""CodeArticle"" = a.""CodeArticle""
                LEFT JOIN l_tags_articles t
                    ON ata.""CodeTagArticle"" = t.""CodeTagArticle""
                GROUP BY 
                    a.""CodeArticle"",
                    a.""Titre"",
                    a.""Resume"",
                    a.""Slug"",
                    a.""Contenu"",
                    a.""DateCreation"",
                    a.""DateMaj"",
                    a.""CreePar"",
                    u.""pseudo"",
                    a.""LienImg"",
                    a.""Publie""
                ORDER BY a.""DateCreation"" DESC
            ")
            .ToListAsync();
    }

    public async Task<ArticlesAdminDto?> DeleteArticleAsync(string codeArticle)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            var article = await _db.Database
                .SqlQueryRaw<ArticlesAdminDto>(@"
                    SELECT 
                        ""CodeArticle"",
                        ""Titre"",
                        ""Resume"",
                        ""Slug"",
                        ""Contenu"",
                        ""DateCreation"",
                        ""DateMaj"",
                        ""CreePar"",
                        ""LienImg"",
                        ""Publie"",
                        NULL AS ""PseudoCreateur"",
                        NULL AS ""Tags""
                    FROM tab_articles
                    WHERE ""CodeArticle"" = {0}
                ", codeArticle)
                .FirstOrDefaultAsync();

            if (article == null)
            {
                await transaction.RollbackAsync();
                return null;
            }

            await _db.Database.ExecuteSqlRawAsync(@"
                DELETE FROM tab_affectations_tags_articles
                WHERE ""CodeArticle"" = {0}
            ", codeArticle);

            var nbDeleted = await _db.Database.ExecuteSqlRawAsync(@"
                DELETE FROM tab_articles
                WHERE ""CodeArticle"" = {0}
            ", codeArticle);

            if (nbDeleted == 0)
            {
                await transaction.RollbackAsync();
                return null;
            }

            await transaction.CommitAsync();

            return article;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<ArticlesAdminDto?> ReversePublishArticleAsync(string codeArticle)
    {
        var updatedArticle = _db.Database
            .SqlQueryRaw<ArticlesAdminDto>(@"
                UPDATE tab_articles
                SET ""Publie"" = CASE 
                    WHEN COALESCE(""Publie"", FALSE) = FALSE THEN TRUE 
                    ELSE FALSE 
                END
                WHERE ""CodeArticle"" = {0}
                RETURNING
                    ""CodeArticle"",
                    ""Titre"",
                    ""Resume"",
                    ""Slug"",
                    ""Contenu"",
                    ""DateCreation"",
                    ""DateMaj"",
                    ""CreePar"",
                    ""LienImg"",
                    ""Publie"",
                    NULL AS ""PseudoCreateur"",
                    NULL AS ""Tags""
            ", codeArticle)
            .AsEnumerable()
            .FirstOrDefault();

        return await Task.FromResult(updatedArticle);
    }

    public async Task<ArticleViewDto?> GetArticleBySlugAsync(string slug, bool incrementView)
    {
        if (incrementView)
        {
            await _db.Database.ExecuteSqlRawAsync(@"
                UPDATE tab_articles
                SET ""NbVues"" = COALESCE(""NbVues"", 0) + 1
                WHERE ""Slug"" = {0}
            ", slug);
        }

        var article = await _db.Database
            .SqlQueryRaw<ArticleViewDto>(@"
                SELECT 
                    a.""CodeArticle"",
                    a.""Titre"",
                    a.""Resume"",
                    a.""Slug"",
                    a.""Contenu"",
                    a.""DateCreation"",
                    a.""DateMaj"",
                    a.""CreePar"",
                    u.""pseudo"" AS ""PseudoCreateur"",
                    a.""LienImg"",
                    STRING_AGG(t.""Libelle"", ',') AS ""Tags"",
                    a.""Publie"" AS ""Publie"",
                    COALESCE(a.""NbVues"", 0) AS ""NbVues""
                FROM tab_articles a
                INNER JOIN tab_users u
                    ON a.""CreePar"" = u.id
                LEFT JOIN tab_affectations_tags_articles ata
                    ON ata.""CodeArticle"" = a.""CodeArticle""
                LEFT JOIN l_tags_articles t
                    ON ata.""CodeTagArticle"" = t.""CodeTagArticle""
                WHERE a.""Slug"" = {0}
                GROUP BY 
                    a.""CodeArticle"",
                    a.""Titre"",
                    a.""Resume"",
                    a.""Slug"",
                    a.""Contenu"",
                    a.""DateCreation"",
                    a.""DateMaj"",
                    a.""CreePar"",
                    u.""pseudo"",
                    a.""LienImg"",
                    a.""Publie"",
                    a.""NbVues""
            ", slug)
            .FirstOrDefaultAsync();

        return article;
    }

    public async Task<List<TagsArticlesDto>> GetAllTagsAsync()
    {
        return await _db.Database
            .SqlQueryRaw<TagsArticlesDto>(@"
                SELECT 
                    ""CodeTagArticle"",
                    ""Libelle""
                FROM l_tags_articles
                ORDER BY ""Libelle"" ASC
            ")
            .ToListAsync();
    }

    public async Task<ArticlesAdminDto?> CreateArticleAsync(CreateArticleDto dto)
    {
        var slugAlreadyExists = await _db.Database
            .SqlQueryRaw<int>(@"
                SELECT COUNT(*) AS ""Value""
                FROM tab_articles
                WHERE ""Slug"" = {0}
            ", dto.Slug)
            .FirstAsync();

        if (slugAlreadyExists > 0)
        {
            return null;
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            var createdArticle = _db.Database
                .SqlQueryRaw<ArticlesAdminDto>(@"
                    INSERT INTO tab_articles 
                        (
                            ""CodeArticle"", 
                            ""Titre"", 
                            ""Resume"", 
                            ""Slug"", 
                            ""Contenu"", 
                            ""DateCreation"", 
                            ""DateMaj"", 
                            ""CreePar"", 
                            ""LienImg"",
                            ""Publie"",
                            ""NbVues""
                        )
                    VALUES 
                        (
                            {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8},
                            false,
                            0
                        )
                    RETURNING
                        ""CodeArticle"",
                        ""Titre"",
                        ""Resume"",
                        ""Slug"",
                        ""Contenu"",
                        ""DateCreation"",
                        ""DateMaj"",
                        ""CreePar"",
                        ""LienImg"",
                        ""Publie"",
                        ""NbVues"",
                        NULL AS ""PseudoCreateur"",
                        NULL AS ""Tags""
                ",
                    dto.CodeArticle,
                    dto.Titre,
                    dto.Resume,
                    dto.Slug,
                    dto.Contenu,
                    dto.DateCreation,
                    dto.DateMaj,
                    dto.CreePar,
                    dto.LienImg
                )
                .AsEnumerable()
                .FirstOrDefault();

            if (createdArticle == null)
            {
                await transaction.RollbackAsync();
                return null;
            }

            foreach (var tag in dto.Tags)
            {
                if (string.IsNullOrWhiteSpace(tag.CodeTagArticle))
                    continue;

                await _db.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO tab_affectations_tags_articles
                        (""CodeArticle"", ""CodeTagArticle"")
                    VALUES
                        ({0}, {1})
                ", dto.CodeArticle, tag.CodeTagArticle);
            }

            await transaction.CommitAsync();

            return createdArticle;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<ArticlesAdminDto?> UpdateArticleAsync(UpdateArticleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ParCodeArticle))
        {
            return null;
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            var updatedArticle = _db.Database
                .SqlQueryRaw<ArticlesAdminDto>(@"
                    UPDATE tab_articles
                    SET 
                        ""Titre"" = {1},
                        ""Resume"" = {2},
                        ""Slug"" = {3},
                        ""Contenu"" = {4},
                        ""DateMaj"" = {5},
                        ""LienImg"" = {6}
                    WHERE ""CodeArticle"" = {0}
                    RETURNING
                        ""CodeArticle"",
                        ""Titre"",
                        ""Resume"",
                        ""Slug"",
                        ""Contenu"",
                        ""DateCreation"",
                        ""DateMaj"",
                        ""CreePar"",
                        ""LienImg"",
                        ""Publie"",
                        ""NbVues"",
                        NULL AS ""PseudoCreateur"",
                        NULL AS ""Tags""
                ",
                    dto.ParCodeArticle,
                    dto.ParTitre,
                    dto.ParResume,
                    dto.ParSlug,
                    dto.ParContenu,
                    dto.ParDateMaj,
                    dto.ParLienImg
                )
                .AsEnumerable()
                .FirstOrDefault();

            if (updatedArticle == null)
            {
                await transaction.RollbackAsync();
                return null;
            }

            await _db.Database.ExecuteSqlRawAsync(@"
                DELETE FROM tab_affectations_tags_articles
                WHERE ""CodeArticle"" = {0}
            ", dto.ParCodeArticle);

            foreach (var tag in dto.ParTags)
            {
                if (string.IsNullOrWhiteSpace(tag.CodeTagArticle))
                    continue;

                await _db.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO tab_affectations_tags_articles
                        (""CodeArticle"", ""CodeTagArticle"")
                    VALUES
                        ({0}, {1})
                ", dto.ParCodeArticle, tag.CodeTagArticle);
            }

            await transaction.CommitAsync();

            return updatedArticle;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
