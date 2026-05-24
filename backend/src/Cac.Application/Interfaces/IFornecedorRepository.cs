using Cac.Application.DTOs;

namespace Cac.Application.Interfaces;

public interface IFornecedorRepository
{
    Task<PagedResultDto<FornecedorListItemDto>> ListarAsync(FornecedorListQueryDto query);
    Task<FornecedorDetailDto?> BuscarPorIdAsync(int id);
    Task<int> CadastrarAsync(FornecedorCreateDto dto);
    Task EditarAsync(int id, FornecedorUpdateDto dto);
    Task DefinirAtivoAsync(int id, bool ativo);
}