using Cac.Application.DTOs;
using Cac.Application.Interfaces;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class ProdutoRepository : IProdutoRepository
{
    private const int CommandTimeoutInSeconds = 60;
    private readonly IDbConnectionFactory _connectionFactory;

    public ProdutoRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResultDto<ProdutoListItemDto>> ListarAsync(ProdutoListQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();

        var rows = (await connection.QueryAsync<ProdutoListItemRowDto>(
            "sp_ListarProdutos",
            new
            {
                ativo            = query.Ativo,
                id_grupo         = query.IdGrupo,
                apenas_em_falta  = query.ApenasEmFalta ?? false,
                busca            = query.Busca,
                pagina           = query.Pagina,
                tamanho_pagina   = query.TamanhoPagina
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds)).ToList();

        var total = rows.FirstOrDefault()?.TotalRegistros ?? 0;

        return new PagedResultDto<ProdutoListItemDto>
        {
            Itens = rows.Select(x => new ProdutoListItemDto
            {
                IdProduto     = x.IdProduto,
                Nome          = x.Nome,
                Descricao     = x.Descricao,
                UnidadeMedida = x.UnidadeMedida,
                Saldo         = x.Saldo,
                EstoqueMinimo = x.EstoqueMinimo,
                PrecoMedio    = x.PrecoMedio,
                Ativo         = x.Ativo,
                IdGrupo       = x.IdGrupo,
                GrupoNome     = x.GrupoNome,
                StatusEstoque = x.StatusEstoque
            }),
            Total        = total,
            Pagina       = query.Pagina,
            TamanhoPagina = query.TamanhoPagina
        };
    }

    public async Task<ProdutoDetailDto?> BuscarPorIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<ProdutoDetailDto>(
            "sp_BuscarProdutoPorId",
            new { id_produto = id },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<int> CadastrarAsync(ProdutoCreateDto dto)
    {
        using var connection = _connectionFactory.CreateConnection();

        var result = await connection.QuerySingleAsync<IdProdutoCriadoRow>(
            "sp_CadastrarProduto",
            new
            {
                id_grupo        = dto.IdGrupo,
                nome            = dto.Nome,
                descricao       = dto.Descricao,
                unidade_medida  = dto.UnidadeMedida,
                estoque_minimo  = dto.EstoqueMinimo
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);

        return result.IdProdutoCriado;
    }

    public async Task EditarAsync(int id, ProdutoUpdateDto dto)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_EditarProduto",
            new
            {
                id_produto      = id,
                id_grupo        = dto.IdGrupo,
                nome            = dto.Nome,
                descricao       = dto.Descricao,
                unidade_medida  = dto.UnidadeMedida,
                estoque_minimo  = dto.EstoqueMinimo
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task DefinirAtivoAsync(int id, bool ativo)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_DefinirAtivoProduto",
            new
            {
                id_produto = id,
                ativo
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    private sealed class ProdutoListItemRowDto
    {
        public int IdProduto { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string UnidadeMedida { get; set; } = string.Empty;
        public decimal Saldo { get; set; }
        public decimal EstoqueMinimo { get; set; }
        public decimal PrecoMedio { get; set; }
        public bool Ativo { get; set; }
        public int IdGrupo { get; set; }
        public string GrupoNome { get; set; } = string.Empty;
        public string StatusEstoque { get; set; } = string.Empty;
        public int TotalRegistros { get; set; }
    }

    private sealed class IdProdutoCriadoRow
    {
        public int IdProdutoCriado { get; set; }
    }
}
