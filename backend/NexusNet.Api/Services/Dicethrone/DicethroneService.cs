using NexusNet.Api.Dtos.Dicethrone;
using NexusNet.Api.Repositories.DiceThrone;

namespace NexusNet.Api.Services.DiceThrone;

public interface IDiceThroneService
{
    Task<List<DiceThroneBoxDto>> GetBoxesAsync();
    Task<List<DiceThroneHeroDto>> GetHerosAsync(string filtreBoxes);
}

public class DiceThroneService : IDiceThroneService
{
    private readonly IDiceThroneRepository _diceThroneRepository;

    public DiceThroneService(IDiceThroneRepository diceThroneRepository)
    {
        _diceThroneRepository = diceThroneRepository;
    }

    public async Task<List<DiceThroneBoxDto>> GetBoxesAsync()
    {
        return await _diceThroneRepository.GetBoxesAsync();
    }

    public async Task<List<DiceThroneHeroDto>> GetHerosAsync(string filtreBoxes)
    {
        return await _diceThroneRepository.GetHerosAsync(filtreBoxes);
    }
}