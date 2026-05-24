using Cac.Application.DTOs;

namespace Cac.Application.Interfaces;

public interface IPerfilRepository
{
    Task<IReadOnlyList<PerfilListItemDto>> ListarAsync();
}
