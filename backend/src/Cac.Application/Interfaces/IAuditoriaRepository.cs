using Cac.Application.DTOs;

namespace Cac.Application.Interfaces;

public interface IAuditoriaRepository
{
    Task<PagedResultDto<AuditoriaItemDto>> ListarAsync(AuditoriaListQueryDto query);
}
