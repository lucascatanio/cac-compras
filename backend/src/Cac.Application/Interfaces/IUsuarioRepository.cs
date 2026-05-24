using Cac.Application.DTOs;

namespace Cac.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<PagedResultDto<UsuarioListItemDto>> ListarAsync(UsuarioListQueryDto query);
    Task<UsuarioDetailDto?> BuscarPorIdAsync(int id);
    Task<int> CadastrarAsync(string username, string senhaHash, string nomeCompleto, string? email, string codigoPerfil);
    Task EditarAsync(int id, string nomeCompleto, string? email, string codigoPerfil);
    Task AlterarSenhaAsync(int id, string novoSenhaHash);
    Task DefinirAtivoAsync(int id, bool ativo);
}
