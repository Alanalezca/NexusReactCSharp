using Microsoft.AspNetCore.Mvc;
using NexusNet.Api.Services.DiceThrone;

namespace NexusNet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiceThroneController : ControllerBase
{
    private readonly IDiceThroneService _diceThroneService;

    public DiceThroneController(IDiceThroneService diceThroneService)
    {
        _diceThroneService = diceThroneService;
    }

    [HttpGet("boites")]
    public async Task<IActionResult> GetBoxes()
    {
        try
        {
            var boxes = await _diceThroneService.GetBoxesAsync();
            return Ok(boxes);
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la récupération des boites Dice Throne : {ex.Message}"
            );

            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }

    [HttpGet("heros")]
    public async Task<IActionResult> GetHeros([FromQuery] string? filtreBoxes)
    {
        try
        {
            var heros = await _diceThroneService.GetHerosAsync(filtreBoxes ?? "");

            if (heros.Count == 0)
            {
                return NotFound(new { error = "Héros non trouvés" });
            }

            return Ok(heros);
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Erreur lors de la récupération des héros Dice Throne : {ex.Message}"
            );

            return StatusCode(500, new { error = "Erreur serveur" });
        }
    }
}