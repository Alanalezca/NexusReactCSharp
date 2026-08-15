using Microsoft.EntityFrameworkCore;
using NexusNet.Api.Data;
using NexusNet.Api.Dtos.Keyforge;
using Npgsql;
using NpgsqlTypes;

namespace NexusNet.Api.Repositories.Keyforge;

public interface IKeyforgeRepository
{
    Task<List<KeyforgeDraftDto>> GetDraftAsync(string idDraft, int userId);

    Task<List<KeyforgeMyDraftDto>> GetMyDraftsAsync(int userId);

    Task<List<KeyforgeSetDto>> GetSetsAsync();

    Task<List<KeyforgeFactionDto>> GetFactionsFromSetAsync(string setId);

    Task<List<KeyforgeBaseCarteDto>> GetBasePoolCartesAsync(string[] factions);

    Task<List<KeyforgePoolCarteDto>> GetPoolCartesPourDraftAsync(string idDraft);

    Task<List<KeyforgePoolCarteDto>> GetPoolCartesValideesAsync(string idDraft);
}

public class KeyforgeRepository : IKeyforgeRepository
{
    private readonly AppDbContext _context;

    public KeyforgeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<KeyforgeSetDto>> GetSetsAsync()
    {
        return await _context.Database
            .SqlQueryRaw<KeyforgeSetDto>(@"
                SELECT
                    ""ID"" AS ""ID"",
                    ""Annee"" AS ""Annee"",
                    ""Numero"" AS ""Numero"",
                    ""Libelle"" AS ""Libelle""
                FROM l_keyforge_sets
                ORDER BY ""Numero"";
            ")
            .ToListAsync();
    }

    public async Task<List<KeyforgeFactionDto>> GetFactionsFromSetAsync(string setId)
    {
        return await _context.Database
            .SqlQueryRaw<KeyforgeFactionDto>(@"
                SELECT DISTINCT
                    f.""ID"" AS ""ID"",
                    f.""Libelle"" AS ""Libelle"",
                    f.""LienImg"" AS ""LienImg"",
                    f.""CouleurRGB"" AS ""CouleurRGB""
                FROM tab_affectations_keyforge_sets_factions a
                JOIN l_keyforge_factions f
                    ON f.""ID"" = a.""IDFaction""
                WHERE a.""IDSet"" = {0};
            ", setId)
            .ToListAsync();
    }

    public async Task<List<KeyforgeBaseCarteDto>> GetBasePoolCartesAsync(
    string[] factions)
    {
        var factionsParameter = new NpgsqlParameter<string[]>(
            "factions",
            NpgsqlDbType.Array | NpgsqlDbType.Text
        )
        {
            TypedValue = factions
        };

        return await _context.Database
            .SqlQueryRaw<KeyforgeBaseCarteDto>(@"
                SELECT
                    d.""ID"" AS ""ID"",
                    d.""QteDispo"" AS ""QteDispo"",
                    d.""Faction"" AS ""Faction"",
                    d.""Ensemble"" AS ""Ensemble"",
                    d.""NbCartesDansEnsemble"" AS ""NbCartesDansEnsemble""
                FROM l_keyforge_cartes d
                WHERE d.""Faction"" = ANY(@factions);
            ", factionsParameter)
            .ToListAsync();
    }

    public async Task<List<KeyforgeDraftDto>> GetDraftAsync(
        string idDraft,
        int userId)
    {
        return await _context.Database
            .SqlQueryRaw<KeyforgeDraftDto>(@"
                SELECT
                    d.""ID"" AS ""ID"",
                    d.""PseudoJ1"" AS ""PseudoJ1"",
                    d.""PseudoJ2"" AS ""PseudoJ2"",

                    d.""FactionBanJ1"" AS ""FactionBanJ1"",
                    d.""FactionBanJ2"" AS ""FactionBanJ2"",

                    d.""FactionPickAJ1"" AS ""FactionPickAJ1"",
                    fa1.""LienImg"" AS ""LienImgAJ1"",
                    fa1.""Libelle"" AS ""LibelleFactionAJ1"",
                    fa1.""CouleurRGB"" AS ""CouleurAJ1"",

                    d.""FactionPickBJ1"" AS ""FactionPickBJ1"",
                    fb1.""LienImg"" AS ""LienImgBJ1"",
                    fb1.""Libelle"" AS ""LibelleFactionBJ1"",
                    fb1.""CouleurRGB"" AS ""CouleurBJ1"",

                    d.""FactionPickCJ1"" AS ""FactionPickCJ1"",
                    fc1.""LienImg"" AS ""LienImgCJ1"",
                    fc1.""Libelle"" AS ""LibelleFactionCJ1"",
                    fc1.""CouleurRGB"" AS ""CouleurCJ1"",

                    d.""FactionPickAJ2"" AS ""FactionPickAJ2"",
                    fa2.""LienImg"" AS ""LienImgAJ2"",
                    fa2.""Libelle"" AS ""LibelleFactionAJ2"",
                    fa2.""CouleurRGB"" AS ""CouleurAJ2"",

                    d.""FactionPickBJ2"" AS ""FactionPickBJ2"",
                    fb2.""LienImg"" AS ""LienImgBJ2"",
                    fb2.""Libelle"" AS ""LibelleFactionBJ2"",
                    fb2.""CouleurRGB"" AS ""CouleurBJ2"",

                    d.""FactionPickCJ2"" AS ""FactionPickCJ2"",
                    fc2.""LienImg"" AS ""LienImgCJ2"",
                    fc2.""Libelle"" AS ""LibelleFactionCJ2"",
                    fc2.""CouleurRGB"" AS ""CouleurCJ2"",

                    d.""AvecAnomalies"" AS ""AvecAnomalies"",
                    d.""Etat"" AS ""Etat"",
                    d.""Commentaire"" AS ""Commentaire"",
                    d.""DateCreation"" AS ""DateCreation"",
                    d.""DateDerModif"" AS ""DateDerModif"",
                    d.""IDSet"" AS ""IDSet"",

                    s.""ID"" AS ""SetID"",
                    d.""Titre"" AS ""Titre"",
                    s.""Libelle"" AS ""Libelle"",
                    s.""Numero"" AS ""Numero"",

                    d.""DraftEnCoursPourJoueurAouB"" AS ""DraftEnCoursPourJoueurAouB"",
                    d.""DraftEnCoursSurFactionAouBouC"" AS ""DraftEnCoursSurFactionAouBouC"",
                    d.""DraftJ1Finished"" AS ""DraftJ1Finished"",
                    d.""DraftJ2Finished"" AS ""DraftJ2Finished""

                FROM tab_keyforge_draftsessions d

                LEFT JOIN l_keyforge_sets s
                    ON d.""IDSet"" = s.""ID""

                LEFT JOIN l_keyforge_factions fa1
                    ON d.""FactionPickAJ1"" = fa1.""ID""

                LEFT JOIN l_keyforge_factions fb1
                    ON d.""FactionPickBJ1"" = fb1.""ID""

                LEFT JOIN l_keyforge_factions fc1
                    ON d.""FactionPickCJ1"" = fc1.""ID""

                LEFT JOIN l_keyforge_factions fa2
                    ON d.""FactionPickAJ2"" = fa2.""ID""

                LEFT JOIN l_keyforge_factions fb2
                    ON d.""FactionPickBJ2"" = fb2.""ID""

                LEFT JOIN l_keyforge_factions fc2
                    ON d.""FactionPickCJ2"" = fc2.""ID""

                WHERE d.""ID"" = {0}
                AND d.""CreePar"" = {1};
            ",
            idDraft,
            userId)
            .ToListAsync();
    }

    public async Task<List<KeyforgeMyDraftDto>> GetMyDraftsAsync(int userId)
    {
        return await _context.Database
            .SqlQueryRaw<KeyforgeMyDraftDto>(@"
                SELECT
                    d.""ID"" AS ""ID"",
                    d.""PseudoJ1"" AS ""PseudoJ1"",
                    d.""PseudoJ2"" AS ""PseudoJ2"",

                    d.""FactionBanJ1"" AS ""FactionBanJ1"",
                    d.""FactionBanJ2"" AS ""FactionBanJ2"",

                    d.""FactionPickAJ1"" AS ""FactionPickAJ1"",
                    d.""FactionPickBJ1"" AS ""FactionPickBJ1"",
                    d.""FactionPickCJ1"" AS ""FactionPickCJ1"",

                    d.""FactionPickAJ2"" AS ""FactionPickAJ2"",
                    d.""FactionPickBJ2"" AS ""FactionPickBJ2"",
                    d.""FactionPickCJ2"" AS ""FactionPickCJ2"",

                    d.""AvecAnomalies"" AS ""AvecAnomalies"",
                    d.""Etat"" AS ""Etat"",
                    d.""Commentaire"" AS ""Commentaire"",
                    d.""DateCreation"" AS ""DateCreation"",
                    d.""DateDerModif"" AS ""DateDerModif"",
                    d.""IDSet"" AS ""IDSet"",

                    s.""ID"" AS ""SetID"",
                    d.""Titre"" AS ""Titre"",

                    f.""LienImg"" AS ""LienImgFactionPickAJ1"",
                    f2.""LienImg"" AS ""LienImgFactionPickBJ1"",
                    f3.""LienImg"" AS ""LienImgFactionPickCJ1"",

                    f4.""LienImg"" AS ""LienImgFactionPickAJ2"",
                    f5.""LienImg"" AS ""LienImgFactionPickBJ2"",
                    f6.""LienImg"" AS ""LienImgFactionPickCJ2""

                FROM tab_keyforge_draftsessions d

                LEFT JOIN l_keyforge_sets s
                    ON d.""IDSet"" = s.""ID""

                LEFT JOIN l_keyforge_factions f
                    ON f.""ID"" = d.""FactionPickAJ1""

                LEFT JOIN l_keyforge_factions f2
                    ON f2.""ID"" = d.""FactionPickBJ1""

                LEFT JOIN l_keyforge_factions f3
                    ON f3.""ID"" = d.""FactionPickCJ1""

                LEFT JOIN l_keyforge_factions f4
                    ON f4.""ID"" = d.""FactionPickAJ2""

                LEFT JOIN l_keyforge_factions f5
                    ON f5.""ID"" = d.""FactionPickBJ2""

                LEFT JOIN l_keyforge_factions f6
                    ON f6.""ID"" = d.""FactionPickCJ2""

                WHERE d.""CreePar"" = {0}

                ORDER BY d.""DateCreation"";
            ",
            userId)
            .ToListAsync();
    }

    public async Task<List<KeyforgePoolCarteDto>> GetPoolCartesPourDraftAsync(
    string idDraft)
    {
        return await _context.Database
            .SqlQueryRaw<KeyforgePoolCarteDto>(@"
                SELECT
                    a.""IDDraftSession"" AS ""IDDraftSession"",
                    a.""IDCarte"" AS ""IDCarte"",
                    a.""JoueurAouB"" AS ""JoueurAouB"",
                    a.""Classement"" AS ""Classement"",

                    c.""Libelle"" AS ""LibelleCarte"",
                    c.""CheminImg"" AS ""CheminImgCarte"",
                    c.""Numero"" AS ""Numero"",
                    c.""Rarete"" AS ""Rarete"",
                    c.""Aombre"" AS ""Aombre"",
                    c.""Puissance"" AS ""Puissance"",
                    c.""Armure"" AS ""Armure"",

                    t.""Libelle"" AS ""LibelleType"",

                    f.""Libelle"" AS ""LibelleFaction"",
                    f.""LienImg"" AS ""LienImgFaction"",
                    f.""ID"" AS ""IDFaction""

                FROM tab_affectations_keyforge_draftpool_cartes a

                JOIN l_keyforge_cartes c
                    ON a.""IDCarte"" = c.""ID""

                JOIN l_keyforge_types t
                    ON c.""Type"" = t.""ID""

                JOIN l_keyforge_factions f
                    ON c.""Faction"" = f.""ID""

                WHERE a.""IDDraftSession"" = {0}

                ORDER BY a.""Classement"";
            ",
            idDraft)
            .ToListAsync();
    }

    public async Task<List<KeyforgePoolCarteDto>> GetPoolCartesValideesAsync(
    string idDraft)
    {
        return await _context.Database
            .SqlQueryRaw<KeyforgePoolCarteDto>(@"
                SELECT
                    a.""IDDraftSession"" AS ""IDDraftSession"",
                    a.""IDCarte"" AS ""IDCarte"",
                    a.""JoueurAouB"" AS ""JoueurAouB"",
                    a.""Classement"" AS ""Classement"",

                    c.""Libelle"" AS ""LibelleCarte"",
                    c.""CheminImg"" AS ""CheminImgCarte"",
                    c.""Numero"" AS ""Numero"",
                    c.""Rarete"" AS ""Rarete"",
                    c.""Aombre"" AS ""Aombre"",
                    c.""Puissance"" AS ""Puissance"",
                    c.""Armure"" AS ""Armure"",

                    t.""Libelle"" AS ""LibelleType"",

                    f.""Libelle"" AS ""LibelleFaction"",
                    f.""LienImg"" AS ""LienImgFaction"",
                    f.""ID"" AS ""IDFaction""

                FROM tab_affectations_keyforge_draftpool_cartes_validees a

                JOIN l_keyforge_cartes c
                    ON a.""IDCarte"" = c.""ID""

                JOIN l_keyforge_types t
                    ON c.""Type"" = t.""ID""

                JOIN l_keyforge_factions f
                    ON c.""Faction"" = f.""ID""

                WHERE a.""IDDraftSession"" = {0}

                ORDER BY a.""Classement"";
            ",
            idDraft)
            .ToListAsync();
    }
}



