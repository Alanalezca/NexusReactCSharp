using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using NexusNet.Api.Services.Keyforge;

namespace NexusNet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KeyforgeController : ControllerBase
{
    private readonly IKeyforgeService _keyforgeService;

    public KeyforgeController(IKeyforgeService keyforgeService)
    {
        _keyforgeService = keyforgeService;
    }


    // ============================================================
    // SETS
    // ============================================================

    [HttpGet("sets")]
    public async Task<IActionResult> GetSets()
    {
        try
        {
            var sets = await _keyforgeService.GetSetsAsync();

            if (sets.Count == 0)
            {
                return NotFound(new { message = "Sets introuvables" });
            }

            return Ok(sets);
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la récupération des sets KeyForge : {ex.Message}"
            );

            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }


    // ============================================================
    // FACTIONS D'UN SET
    // ============================================================

    [HttpGet("factions")]
    public async Task<IActionResult> GetFactionsFromSet(
        [FromQuery] string setId)
    {
        try
        {
            var factions = await _keyforgeService
                .GetFactionsFromSetAsync(setId);

            if (factions.Count == 0)
            {
                return NotFound(
                    new { message = "Factions du set introuvables" }
                );
            }

            return Ok(factions);
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la récupération des factions KeyForge : {ex.Message}"
            );

            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }


    // ============================================================
    // BASE DU POOL DE CARTES
    // ============================================================

    [HttpGet("base-pool")]
    public async Task<IActionResult> GetBasePoolCartes(
        [FromQuery] string factions)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(factions))
            {
                return BadRequest(
                    new { message = "Aucune faction renseignée" }
                );
            }

            var factionsArray = factions
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(f => f.Trim())
                .ToArray();

            var cartes = await _keyforgeService
                .GetBasePoolCartesAsync(factionsArray);

            if (cartes.Count == 0)
            {
                return NotFound(
                    new { message = "Chargement du pool de cartes échoué" }
                );
            }

            return Ok(cartes);
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la récupération du pool KeyForge : {ex.Message}"
            );

            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }


    // ============================================================
    // MES DRAFTS
    // ============================================================

    [Authorize]
    [HttpGet("my-drafts")]
    public async Task<IActionResult> GetMyDrafts()
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(
                    new { message = "Utilisateur non authentifié" }
                );
            }

            var drafts = await _keyforgeService
                .GetMyDraftsAsync(userId);

            return Ok(drafts);
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la récupération des drafts KeyForge : {ex.Message}"
            );

            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }


    // ============================================================
    // DRAFT SPÉCIFIQUE
    // ============================================================

    [Authorize]
    [HttpGet("draft/{idDraft}")]
    public async Task<IActionResult> GetDraft(string idDraft)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(
                    new { message = "Utilisateur non authentifié" }
                );
            }

            var drafts = await _keyforgeService
                .GetDraftAsync(idDraft, userId);

            if (drafts.Count == 0)
            {
                return NotFound(
                    new { message = "Draft introuvable" }
                );
            }

            return Ok(drafts);
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la récupération du draft KeyForge : {ex.Message}"
            );

            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }


    // ============================================================
    // POOL DU DRAFT
    // ============================================================

    [Authorize]
    [HttpGet("draft/{idDraft}/pool")]
    public async Task<IActionResult> GetPoolCartesPourDraft(
        string idDraft)
    {
        try
        {
            var cartes = await _keyforgeService
                .GetPoolCartesPourDraftAsync(idDraft);

            return Ok(cartes);
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la récupération du pool du draft : {ex.Message}"
            );

            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }


    // ============================================================
    // CARTES VALIDÉES DU DRAFT
    // ============================================================

    [Authorize]
    [HttpGet("draft/{idDraft}/pool-valide")]
    public async Task<IActionResult> GetPoolCartesValidees(
        string idDraft)
    {
        try
        {
            var cartes = await _keyforgeService
                .GetPoolCartesValideesAsync(idDraft);

            return Ok(cartes);
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la récupération des cartes validées : {ex.Message}"
            );

            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }
}