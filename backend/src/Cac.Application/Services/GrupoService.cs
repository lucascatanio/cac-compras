using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class GrupoService
{
    private readonly IGrupoRepository _grupoRepository;

    public GrupoService(IGrupoRepository grupoRepository)
    {
        _grupoRepository = grupoRepository;
    }

    public async Task<IReadOnlyList<GrupoListItemDto>> ListarAsync(string? busca)
    {
        var grupos = await _grupoRepository.ListarAsync(NormalizeNullable(busca));

        return grupos
            .Select(g => new GrupoListItemDto(
                IdGrupo: g.IdGrupo,
                Nome: g.Nome,
                Descricao: g.Descricao,
                QtdProdutosAtivos: g.QtdProdutosAtivos ?? 0
            ))
            .ToList();
    }

    public async Task<GrupoDetailDto?> BuscarPorIdAsync(int idGrupo)
    {
        var grupo = await _grupoRepository.BuscarPorIdAsync(idGrupo);

        if (grupo is null)
            return null;

        return new GrupoDetailDto(
            IdGrupo: grupo.IdGrupo,
            Nome: grupo.Nome,
            Descricao: grupo.Descricao
        );
    }

    public async Task<int> CadastrarAsync(GrupoCreateRequest request)
    {
        return await _grupoRepository.CadastrarAsync(
            NormalizeRequired(request.Nome),
            NormalizeNullable(request.Descricao)
        );
    }

    public async Task EditarAsync(int idGrupo, GrupoUpdateRequest request)
    {
        await _grupoRepository.EditarAsync(
            idGrupo,
            NormalizeRequired(request.Nome),
            NormalizeNullable(request.Descricao)
        );
    }

    private static string NormalizeRequired(string value)
    {
        return value.Trim();
    }

    private static string? NormalizeNullable(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return value.Trim();
    }
}