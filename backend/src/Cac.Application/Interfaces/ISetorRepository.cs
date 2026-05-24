using Cac.Domain.Entities;

namespace Cac.Application.Interfaces;

public interface ISetorRepository
{
    Task<IReadOnlyList<Setor>> ListarAsync(bool? ativo, string? busca);
    Task<Setor?> BuscarPorIdAsync(int idSetor);
    Task<int> CadastrarAsync(string nome, string? descricao);
    Task EditarAsync(int idSetor, string nome, string? descricao);
    Task DefinirAtivoAsync(int idSetor, bool ativo);
}
