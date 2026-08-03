using Microsoft.EntityFrameworkCore;
using NexusNet.Api.Data;
using NexusNet.Api.Dtos.Smashup;

namespace NexusNet.Api.Repositories.Smashup;

public interface ISmashupRepository
{
    Task<List<SmashupBoxDto>> GetBoxesAsync();

    Task<List<SmashupFactionDto>> GetFactionsAsync(string filtreBoxes);
}

public class SmashupRepository : ISmashupRepository
{
    private readonly AppDbContext _context;

    public SmashupRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<SmashupBoxDto>> GetBoxesAsync()
    {
        return await _context.Database
            .SqlQueryRaw<SmashupBoxDto>(@"
                SELECT 
                    b.""CodeBox"" AS ""CodeBox"",
                    b.""Libelle"" AS ""Libelle"",
                    b.""LienImg"" AS ""LienImg"",
                    b.""Classement"" AS ""Classement"",
                    COUNT(f.""CodeFaction"")::int AS ""NbFactions""
                FROM l_smashup_boxes b
                LEFT JOIN l_smashup_factions f 
                    ON b.""CodeBox"" = f.""CodeBox""
                WHERE b.""Actif"" = TRUE
                GROUP BY 
                    b.""CodeBox"", 
                    b.""Libelle"", 
                    b.""LienImg"", 
                    b.""Classement""
                ORDER BY b.""Classement"";
            ")
            .ToListAsync();
    }

    public async Task<List<SmashupFactionDto>> GetFactionsAsync(string filtreBoxes)
    {
        return await _context.Database
            .SqlQueryRaw<SmashupFactionDto>(@"
                SELECT DISTINCT
                    f.""CodeFaction"" AS ""CodeFaction"",
                    f.""CodeBox"" AS ""CodeBox"",
                    f.""Libelle"" AS ""Libelle"",
                    f.""LienImg"" AS ""LienImg"",
                    f.""Classement""::int AS ""Classement"",
                    f.""AvecTitan"" AS ""AvecTitan"",
                    TRUE AS ""Pickable""
                FROM l_smashup_factions f
                WHERE f.""Actif"" = TRUE
                AND (
                    ({0}::text = '')
                    OR (('$' || {0}::text || '$') LIKE '%$' || f.""CodeBox"" || '$%')
                )
                GROUP BY
                    f.""CodeFaction"",
                    f.""CodeBox"",
                    f.""Libelle"",
                    f.""LienImg"",
                    f.""Classement"",
                    f.""AvecTitan""
                ORDER BY f.""Classement""::int;
            ", filtreBoxes)
            .ToListAsync();
    }
}