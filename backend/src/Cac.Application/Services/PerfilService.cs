using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class PerfilService
{
    private readonly IPerfilRepository _repository;

    public PerfilService(IPerfilRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<PerfilListItemDto>> ListarAsync()
        => _repository.ListarAsync();
}
