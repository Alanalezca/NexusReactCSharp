using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using NexusNet.Api.Services.Keyforge;
using NexusNet.Api.Dtos.Keyforge;

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

    // ============================================================
    // CRÉATION D'UN DRAFT
    // ============================================================

    [Authorize]
    [HttpPost("creationNewDraft")]
    public async Task<IActionResult> CreateDraft(
        [FromBody] CreateKeyforgeDraftDto dto)
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

            var success = await _keyforgeService.CreateDraftAsync(
                dto,
                userId
            );

            if (!success)
            {
                return StatusCode(
                    500,
                    new { message = "Création du nouveau draft échouée" }
                );
            }

            return Ok(
                new { message = "Draft créé avec succès" }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la création du draft KeyForge : {ex.Message}"
            );

            return StatusCode(
                500,
                new { error = "Erreur serveur" }
            );
        }
    }

    // ============================================================
    // SUPPRESSION D'UN DRAFT
    // ============================================================

    [Authorize]
    [HttpDelete("draft/{idDraft}")]
    public async Task<IActionResult> DeleteDraft(string idDraft)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(idDraft))
            {
                return BadRequest(
                    new { message = "Identifiant du draft manquant" }
                );
            }

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(
                    new { message = "Utilisateur non authentifié" }
                );
            }

            var success = await _keyforgeService.DeleteDraftAsync(
                idDraft,
                userId
            );

            if (!success)
            {
                return NotFound(
                    new { message = "Draft introuvable ou non autorisé" }
                );
            }

            return Ok(
                new { message = "Draft supprimé avec succès" }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la suppression du draft KeyForge : {ex.Message}"
            );

            return StatusCode(
                500,
                new { error = "Erreur serveur" }
            );
        }
    }

    // ============================================================
    // MISE À JOUR PICKS / BANS DES FACTIONS
    // ============================================================

    [Authorize]
    [HttpPost("updateFactionsSpecificDraft")]
    public async Task<IActionResult> UpdateFactionsSpecificDraft(
        [FromBody] UpdateKeyforgeFactionsDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(
                    new { message = "Utilisateur non authentifié" }
                );
            }

            var success = await _keyforgeService.UpdateFactionsDraftAsync(
                dto,
                userId
            );

            if (!success)
            {
                return NotFound(
                    new
                    {
                        message = "Update des factions dans le draft en cours échouée"
                    }
                );
            }

            return Ok(
                new { message = "Factions du draft mises à jour avec succès" }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la mise à jour des factions KeyForge : {ex.Message}"
            );

            return StatusCode(
                500,
                new { error = "Erreur serveur" }
            );
        }
    }

    [Authorize]
    [HttpPost("draft/{idDraft}/pool")]
    public async Task<IActionResult> CreatePoolCartesPourDraft(
        string idDraft,
        [FromBody] List<CreateKeyforgePoolCarteDto> cartes)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(idDraft))
            {
                return BadRequest(
                    new { message = "Identifiant du draft manquant" }
                );
            }

            if (cartes == null || cartes.Count == 0)
            {
                return BadRequest(
                    new { message = "Aucune carte à enregistrer" }
                );
            }

            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(
                    new { message = "Utilisateur non authentifié" }
                );
            }

            var success = await _keyforgeService.CreatePoolCartesAsync(
                idDraft,
                cartes,
                userId
            );

            if (!success)
            {
                return NotFound(
                    new { message = "Draft introuvable ou non autorisé" }
                );
            }

            return Ok(
                new { message = "Pool de cartes créé avec succès" }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la création du pool KeyForge : {ex.Message}"
            );

            return StatusCode(
                500,
                new { error = "Erreur serveur" }
            );
        }
    }

    // ============================================================
    // MISE À JOUR DU JOUEUR ACTIF DU DRAFT
    // ============================================================

    [Authorize]
    [HttpPost("draft/{idDraft}/focus-joueur")]
    public async Task<IActionResult> UpdateFocusJoueur(
        string idDraft,
        [FromBody] UpdateKeyforgeFocusJoueurDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(
                    new { message = "Utilisateur non authentifié" }
                );
            }

            var success = await _keyforgeService.UpdateFocusJoueurAsync(
                idDraft,
                dto.JoueurAouB,
                userId
            );

            if (!success)
            {
                return NotFound(
                    new { message = "Draft introuvable ou non autorisé" }
                );
            }

            return Ok(
                new { message = "Joueur actif mis à jour avec succès" }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la mise à jour du joueur actif KeyForge : {ex.Message}"
            );

            return StatusCode(
                500,
                new { error = "Erreur serveur" }
            );
        }
    }

    // ============================================================
    // MISE À JOUR DE L'ÉTAPE DU DRAFT
    // ============================================================

    [Authorize]
    [HttpPost("draft/{idDraft}/etape")]
    public async Task<IActionResult> UpdateEtapeDraft(
        string idDraft,
        [FromBody] UpdateKeyforgeEtapeDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(
                    new { message = "Utilisateur non authentifié" }
                );
            }

            var success = await _keyforgeService.UpdateEtapeDraftAsync(
                idDraft,
                dto.Etape,
                userId
            );

            if (!success)
            {
                return NotFound(
                    new { message = "Draft introuvable ou non autorisé" }
                );
            }

            return Ok(
                new { message = "Étape du draft mise à jour avec succès" }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la mise à jour de l'étape du draft KeyForge : {ex.Message}"
            );

            return StatusCode(
                500,
                new { error = "Erreur serveur" }
            );
        }
    }
}