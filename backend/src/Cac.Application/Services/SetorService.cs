using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class SetorService
{
    private readonly ISetorRepository _setorRepository;

    public SetorService(ISetorRepository setorRepository)
    {
        _setorRepository = setorRepository;
    }

    public async Task<IReadOnlyList<SetorListItemDto>> ListarAsync(SetorListQueryDto query)
    {
        var setores = await _setorRepository.ListarAsync(
            query.Ativo,
            NormalizeNullable(query.Busca)
        );

        return setores
            .Select(s => new SetorListItemDto
            {
                IdSetor = s.IdSetor,
                Nome = s.Nome,
                Descricao = s.Descricao,
                Ativo = s.Ativo
            })
            .ToList();
    }

    public async Task<SetorDetailDto?> BuscarPorIdAsync(int idSetor)
    {
        var setor = await _setorRepository.BuscarPorIdAsync(idSetor);

        if (setor is null)
            return null;

        return new SetorDetailDto
        {
            IdSetor = setor.IdSetor,
            Nome = setor.Nome,
            Descricao = setor.Descricao,
            Ativo = setor.Ativo
        };
    }

    public async Task<int> CadastrarAsync(SetorCreateDto dto)
    {
        return await _setorRepository.CadastrarAsync(
            NormalizeRequired(dto.Nome),
            NormalizeNullable(dto.Descricao)
        );
    }

    public async Task EditarAsync(int idSetor, SetorUpdateDto dto)
    {
        await _setorRepository.EditarAsync(
            idSetor,
            NormalizeRequired(dto.Nome),
            NormalizeNullable(dto.Descricao)
        );
    }

    public async Task DefinirAtivoAsync(int idSetor, bool ativo)
    {
        await _setorRepository.DefinirAtivoAsync(idSetor, ativo);
    }

    private static string NormalizeRequired(string value) => value.Trim();

    private static string? NormalizeNullable(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;
        return value.Trim();
    }
}
