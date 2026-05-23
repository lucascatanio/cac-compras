using Cac.Domain.Entities;

namespace Cac.Application.Interfaces;

public interface IAuthRepository
{
    Task<Usuario?> BuscarUsuarioPorUsernameAsync(string username);
    Task RegistrarUltimoLoginAsync(int idUsuario);
}