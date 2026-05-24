using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class FornecedorService
{
    private readonly IFornecedorRepository _repository;

    public FornecedorService(IFornecedorRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResultDto<FornecedorListItemDto>> ListarAsync(FornecedorListQueryDto query)
        => _repository.ListarAsync(query);

    public Task<FornecedorDetailDto?> BuscarPorIdAsync(int id)
        => _repository.BuscarPorIdAsync(id);

    public Task<int> CadastrarAsync(FornecedorCreateDto dto)
        => _repository.CadastrarAsync(dto);

    public Task EditarAsync(int id, FornecedorUpdateDto dto)
        => _repository.EditarAsync(id, dto);

    public Task DefinirAtivoAsync(int id, bool ativo)
        => _repository.DefinirAtivoAsync(id, ativo);
}