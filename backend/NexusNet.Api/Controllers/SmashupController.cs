using Microsoft.AspNetCore.Mvc;
using NexusNet.Api.Services.Smashup;

namespace NexusNet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SmashupController : ControllerBase
{
    private readonly ISmashupService _smashupService;

    public SmashupController(ISmashupService smashupService)
    {
        _smashupService = smashupService;
    }

    [HttpGet("boites")]
    public async Task<IActionResult> GetBoxes()
    {
        try
        {
            var boxes = await _smashupService.GetBoxesAsync();
            return Ok(boxes);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur lors de la récupération des boites Smash Up : {ex.Message}");
            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }

    [HttpGet("factions")]
    public async Task<IActionResult> GetFactions([FromQuery] string? filtreBoxes)
    {
        try
        {
            var factions = await _smashupService.GetFactionsAsync(filtreBoxes ?? "");

            if (factions.Count == 0)
            {
                return NotFound(new { error = "Factions non trouvées" });
            }

            return Ok(factions);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur lors de la récupération des factions Smash Up : {ex.Message}");
            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }
}