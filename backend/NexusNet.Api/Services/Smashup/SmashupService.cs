using NexusNet.Api.Dtos.Smashup;
using NexusNet.Api.Repositories.Smashup;

namespace NexusNet.Api.Services.Smashup;

public interface ISmashupService
{
    Task<List<SmashupBoxDto>> GetBoxesAsync();
    Task<List<SmashupFactionDto>> GetFactionsAsync(string filtreBoxes);
}

public class SmashupService : ISmashupService
{
    private readonly ISmashupRepository _smashupRepository;

    public SmashupService(ISmashupRepository smashupRepository)
    {
        _smashupRepository = smashupRepository;
    }

    public async Task<List<SmashupBoxDto>> GetBoxesAsync()
    {
        return await _smashupRepository.GetBoxesAsync();
    }

    public async Task<List<SmashupFactionDto>> GetFactionsAsync(string filtreBoxes)
    {
        return await _smashupRepository.GetFactionsAsync(filtreBoxes);
    }
}