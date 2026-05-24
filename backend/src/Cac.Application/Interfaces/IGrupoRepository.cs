using Cac.Domain.Entities;

namespace Cac.Application.Interfaces;

public interface IGrupoRepository
{
    Task<IReadOnlyList<Grupo>> ListarAsync(string? busca);
    Task<Grupo?> BuscarPorIdAsync(int idGrupo);
    Task<int> CadastrarAsync(string nome, string? descricao);
    Task EditarAsync(int idGrupo, string nome, string? descricao);
}