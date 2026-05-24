using Cac.Application.DTOs;

namespace Cac.Application.Interfaces;

public interface ISaidaRepository
{
    Task<PagedResultDto<SaidaListItemDto>> ListarAsync(SaidaListQueryDto query);
    Task<SaidaDetailDto?> BuscarPorIdAsync(int id);
    Task<int> RegistrarAsync(RegistrarSaidaDto dto);
}
