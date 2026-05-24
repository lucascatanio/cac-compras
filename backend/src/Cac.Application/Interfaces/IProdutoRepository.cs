using Cac.Application.DTOs;

namespace Cac.Application.Interfaces;

public interface IProdutoRepository
{
    Task<PagedResultDto<ProdutoListItemDto>> ListarAsync(ProdutoListQueryDto query);
    Task<ProdutoDetailDto?> BuscarPorIdAsync(int id);
    Task<int> CadastrarAsync(ProdutoCreateDto dto);
    Task EditarAsync(int id, ProdutoUpdateDto dto);
    Task DefinirAtivoAsync(int id, bool ativo);
}
