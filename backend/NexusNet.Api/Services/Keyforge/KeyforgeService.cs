using NexusNet.Api.Dtos.Keyforge;
using NexusNet.Api.Repositories.Keyforge;

namespace NexusNet.Api.Services.Keyforge;

public interface IKeyforgeService
{
    Task<List<KeyforgeDraftDto>> GetDraftAsync(
        string idDraft,
        int userId
    );

    Task<List<KeyforgeMyDraftDto>> GetMyDraftsAsync(
        int userId
    );

    Task<List<KeyforgeSetDto>> GetSetsAsync();

    Task<List<KeyforgeFactionDto>> GetFactionsFromSetAsync(
        string setId
    );

    Task<List<KeyforgeBaseCarteDto>> GetBasePoolCartesAsync(
        string[] factions
    );

    Task<List<KeyforgePoolCarteDto>> GetPoolCartesPourDraftAsync(
        string idDraft
    );

    Task<List<KeyforgePoolCarteDto>> GetPoolCartesValideesAsync(
        string idDraft
    );
}

public class KeyforgeService : IKeyforgeService
{
    private readonly IKeyforgeRepository _keyforgeRepository;

    public KeyforgeService(IKeyforgeRepository keyforgeRepository)
    {
        _keyforgeRepository = keyforgeRepository;
    }

    public async Task<List<KeyforgeDraftDto>> GetDraftAsync(
        string idDraft,
        int userId)
    {
        return await _keyforgeRepository.GetDraftAsync(idDraft, userId);
    }

    public async Task<List<KeyforgeMyDraftDto>> GetMyDraftsAsync(int userId)
    {
        return await _keyforgeRepository.GetMyDraftsAsync(userId);
    }

    public async Task<List<KeyforgeSetDto>> GetSetsAsync()
    {
        return await _keyforgeRepository.GetSetsAsync();
    }

    public async Task<List<KeyforgeFactionDto>> GetFactionsFromSetAsync(string setId)
    {
        return await _keyforgeRepository.GetFactionsFromSetAsync(setId);
    }

    public async Task<List<KeyforgeBaseCarteDto>> GetBasePoolCartesAsync(
        string[] factions)
    {
        return await _keyforgeRepository.GetBasePoolCartesAsync(factions);
    }

    public async Task<List<KeyforgePoolCarteDto>> GetPoolCartesPourDraftAsync(
        string idDraft)
    {
        return await _keyforgeRepository.GetPoolCartesPourDraftAsync(idDraft);
    }

    public async Task<List<KeyforgePoolCarteDto>> GetPoolCartesValideesAsync(
        string idDraft)
    {
        return await _keyforgeRepository.GetPoolCartesValideesAsync(idDraft);
    }
}