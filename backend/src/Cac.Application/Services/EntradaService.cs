using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class EntradaService
{
    private readonly IEntradaRepository _repository;

    public EntradaService(IEntradaRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResultDto<EntradaListItemDto>> ListarAsync(EntradaListQueryDto query)
        => _repository.ListarAsync(query);

    public Task<EntradaDetailDto?> BuscarPorIdAsync(int id)
        => _repository.BuscarPorIdAsync(id);

    public Task<int> RegistrarAsync(RegistrarEntradaDto dto)
        => _repository.RegistrarAsync(dto);
}
