using Cac.Application.DTOs;

namespace Cac.Application.Interfaces;

public interface IEntradaRepository
{
    Task<PagedResultDto<EntradaListItemDto>> ListarAsync(EntradaListQueryDto query);
    Task<EntradaDetailDto?> BuscarPorIdAsync(int id);
    Task<int> RegistrarAsync(RegistrarEntradaDto dto);
}
