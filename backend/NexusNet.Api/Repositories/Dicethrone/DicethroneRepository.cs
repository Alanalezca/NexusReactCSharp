using Microsoft.EntityFrameworkCore;
using NexusNet.Api.Data;
using NexusNet.Api.Dtos.Dicethrone;

namespace NexusNet.Api.Repositories.DiceThrone;

public interface IDiceThroneRepository
{
    Task<List<DiceThroneBoxDto>> GetBoxesAsync();

    Task<List<DiceThroneHeroDto>> GetHerosAsync(string filtreBoxes);
}

public class DiceThroneRepository : IDiceThroneRepository
{
    private readonly AppDbContext _context;

    public DiceThroneRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<DiceThroneBoxDto>> GetBoxesAsync()
    {
        return await _context.Database
            .SqlQueryRaw<DiceThroneBoxDto>(@"
                SELECT 
                    b.""CodeBox"" AS ""CodeBox"",
                    b.""Libelle"" AS ""Libelle"",
                    b.""LienImg"" AS ""LienImg"",
                    b.""Classement""::int AS ""Classement"",
                    COUNT(h.""CodeHeros"")::int AS ""NbHeros"",
                    b.""Vague"" AS ""Vague""
                FROM l_dicethrone_boxes b
                LEFT JOIN l_dicethrone_heros h 
                    ON b.""CodeBox"" = h.""CodeBox""
                WHERE b.""Actif"" = TRUE
                GROUP BY 
                    b.""CodeBox"", 
                    b.""Libelle"", 
                    b.""LienImg"", 
                    b.""Classement"",
                    b.""Vague""
                ORDER BY b.""Classement""::int;
            ")
            .ToListAsync();
    }

    public async Task<List<DiceThroneHeroDto>> GetHerosAsync(string filtreBoxes)
    {
        return await _context.Database
            .SqlQueryRaw<DiceThroneHeroDto>(@"
                SELECT DISTINCT
                    h.""CodeHeros"" AS ""CodeHeros"",
                    h.""CodeBox"" AS ""CodeBox"",
                    h.""Libelle"" AS ""Libelle"",
                    h.""LienImg"" AS ""LienImg"",
                    h.""Classement""::int AS ""Classement"",
                    b.""Vague"" AS ""Vague"",
                    TRUE AS ""Pickable""
                FROM l_dicethrone_boxes b
                LEFT JOIN l_dicethrone_heros h 
                    ON b.""CodeBox"" = h.""CodeBox""
                WHERE h.""Actif"" = TRUE
                AND (
                    ({0}::text = '')
                    OR (('$' || {0}::text || '$') LIKE '%$' || h.""CodeBox"" || '$%')
                )
                ORDER BY h.""Classement""::int;
            ", filtreBoxes)
            .ToListAsync();
    }
}