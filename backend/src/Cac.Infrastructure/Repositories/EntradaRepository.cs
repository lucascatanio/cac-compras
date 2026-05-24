using Cac.Application.DTOs;
using Cac.Application.Interfaces;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class EntradaRepository : IEntradaRepository
{
    private const int CommandTimeoutInSeconds = 60;
    private readonly IDbConnectionFactory _connectionFactory;

    public EntradaRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResultDto<EntradaListItemDto>> ListarAsync(EntradaListQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();

        var rows = (await connection.QueryAsync<EntradaListItemRowDto>(
            "sp_ListarEntradas",
            new
            {
                data_inicio = query.DataInicio,
                data_fim = query.DataFim,
                id_fornecedor = query.IdFornecedor,
                pagina = query.Pagina,
                tamanho_pagina = query.TamanhoPagina
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds)).ToList();

        var total = rows.FirstOrDefault()?.TotalRegistros ?? 0;

        return new PagedResultDto<EntradaListItemDto>
        {
            Itens = rows.Select(x => new EntradaListItemDto
            {
                IdEntrada = x.IdEntrada,
                DataEntrada = x.DataEntrada,
                NumeroNotaFiscal = x.NumeroNotaFiscal,
                Observacao = x.Observacao,
                IdFornecedor = x.IdFornecedor,
                Fornecedor = x.Fornecedor,
                QtdItens = x.QtdItens,
                ValorTotal = x.ValorTotal
            }),
            Total = total,
            Pagina = query.Pagina,
            TamanhoPagina = query.TamanhoPagina
        };
    }

    public async Task<EntradaDetailDto?> BuscarPorIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        using var multi = await connection.QueryMultipleAsync(
            "sp_BuscarEntradaPorId",
            new { id_entrada = id },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);

        var cabecalho = await multi.ReadSingleOrDefaultAsync<EntradaCabecalhoRowDto>();
        if (cabecalho is null) return null;

        var itens = (await multi.ReadAsync<EntradaItemRowDto>()).ToList();

        return new EntradaDetailDto
        {
            IdEntrada = cabecalho.IdEntrada,
            DataEntrada = cabecalho.DataEntrada,
            NumeroNotaFiscal = cabecalho.NumeroNotaFiscal,
            Observacao = cabecalho.Observacao,
            IdFornecedor = cabecalho.IdFornecedor,
            Fornecedor = cabecalho.Fornecedor,
            Cnpj = cabecalho.Cnpj,
            Itens = itens.Select(x => new EntradaItemDto
            {
                IdItemEntrada = x.IdItemEntrada,
                IdProduto = x.IdProduto,
                Produto = x.Produto,
                UnidadeMedida = x.UnidadeMedida,
                Quantidade = x.Quantidade,
                PrecoUnitario = x.PrecoUnitario,
                ValorTotal = x.ValorTotal
            })
        };
    }

    public async Task<int> RegistrarAsync(RegistrarEntradaDto dto)
    {
        using var connection = _connectionFactory.CreateConnection();

        using var dt = new DataTable();
        dt.Columns.Add("id_produto", typeof(int));
        dt.Columns.Add("quantidade", typeof(decimal));
        dt.Columns.Add("preco_unitario", typeof(decimal));

        foreach (var item in dto.Itens)
            dt.Rows.Add(item.IdProduto, item.Quantidade, item.PrecoUnitario);

        var param = new DynamicParameters();
        param.Add("@id_fornecedor", dto.IdFornecedor);
        param.Add("@numero_nota_fiscal", dto.NumeroNotaFiscal);
        param.Add("@observacao", dto.Observacao);
        param.Add("@itens", dt.AsTableValuedParameter("TVP_ItensEntrada"));

        var result = await connection.QuerySingleAsync<IdEntradaCriadaRow>(
            "sp_RegistrarEntrada",
            param,
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);

        return result.IdEntradaCriada;
    }

    private sealed class EntradaListItemRowDto
    {
        public int IdEntrada { get; set; }
        public DateTime DataEntrada { get; set; }
        public string? NumeroNotaFiscal { get; set; }
        public string? Observacao { get; set; }
        public int IdFornecedor { get; set; }
        public string Fornecedor { get; set; } = string.Empty;
        public int QtdItens { get; set; }
        public decimal? ValorTotal { get; set; }
        public int TotalRegistros { get; set; }
    }

    private sealed class EntradaCabecalhoRowDto
    {
        public int IdEntrada { get; set; }
        public DateTime DataEntrada { get; set; }
        public string? NumeroNotaFiscal { get; set; }
        public string? Observacao { get; set; }
        public int IdFornecedor { get; set; }
        public string Fornecedor { get; set; } = string.Empty;
        public string Cnpj { get; set; } = string.Empty;
    }

    private sealed class EntradaItemRowDto
    {
        public int IdItemEntrada { get; set; }
        public int IdProduto { get; set; }
        public string Produto { get; set; } = string.Empty;
        public string UnidadeMedida { get; set; } = string.Empty;
        public decimal Quantidade { get; set; }
        public decimal PrecoUnitario { get; set; }
        public decimal ValorTotal { get; set; }
    }

    private sealed class IdEntradaCriadaRow
    {
        public int IdEntradaCriada { get; set; }
    }
}
