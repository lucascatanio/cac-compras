using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class AuditoriaService
{
    private readonly IAuditoriaRepository _repository;

    public AuditoriaService(IAuditoriaRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResultDto<AuditoriaItemDto>> ListarAsync(AuditoriaListQueryDto query)
        => _repository.ListarAsync(query);
}
