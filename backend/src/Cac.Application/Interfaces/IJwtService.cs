using Cac.Domain.Entities;

namespace Cac.Application.Interfaces;

public interface IJwtService
{
    string GerarToken(Usuario usuario);
}