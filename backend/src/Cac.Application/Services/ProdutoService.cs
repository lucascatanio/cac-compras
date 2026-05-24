using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class ProdutoService
{
    private readonly IProdutoRepository _repository;

    public ProdutoService(IProdutoRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResultDto<ProdutoListItemDto>> ListarAsync(ProdutoListQueryDto query)
        => _repository.ListarAsync(query);

    public Task<ProdutoDetailDto?> BuscarPorIdAsync(int id)
        => _repository.BuscarPorIdAsync(id);

    public Task<int> CadastrarAsync(ProdutoCreateDto dto)
        => _repository.CadastrarAsync(dto);

    public Task EditarAsync(int id, ProdutoUpdateDto dto)
        => _repository.EditarAsync(id, dto);

    public Task DefinirAtivoAsync(int id, bool ativo)
        => _repository.DefinirAtivoAsync(id, ativo);
}
