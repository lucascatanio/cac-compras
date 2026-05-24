using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class SaidaService
{
    private readonly ISaidaRepository _repository;

    public SaidaService(ISaidaRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResultDto<SaidaListItemDto>> ListarAsync(SaidaListQueryDto query)
        => _repository.ListarAsync(query);

    public Task<SaidaDetailDto?> BuscarPorIdAsync(int id)
        => _repository.BuscarPorIdAsync(id);

    public Task<int> RegistrarAsync(RegistrarSaidaDto dto)
        => _repository.RegistrarAsync(dto);
}
