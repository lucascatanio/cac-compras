using Cac.Application.DTOs;
using Cac.Application.Interfaces;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class SaidaRepository : ISaidaRepository
{
    private const int CommandTimeoutInSeconds = 60;
    private readonly IDbConnectionFactory _connectionFactory;

    public SaidaRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResultDto<SaidaListItemDto>> ListarAsync(SaidaListQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();

        var rows = (await connection.QueryAsync<SaidaListItemRowDto>(
            "sp_ListarSaidas",
            new
            {
                data_inicio = query.DataInicio,
                data_fim = query.DataFim,
                id_setor = query.IdSetor,
                pagina = query.Pagina,
                tamanho_pagina = query.TamanhoPagina
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds)).ToList();

        var total = rows.FirstOrDefault()?.TotalRegistros ?? 0;

        return new PagedResultDto<SaidaListItemDto>
        {
            Itens = rows.Select(x => new SaidaListItemDto
            {
                IdSaida = x.IdSaida,
                DataSaida = x.DataSaida,
                Observacao = x.Observacao,
                IdSetor = x.IdSetor,
                Setor = x.Setor,
                QtdItens = x.QtdItens,
                ValorTotal = x.ValorTotal
            }),
            Total = total,
            Pagina = query.Pagina,
            TamanhoPagina = query.TamanhoPagina
        };
    }

    public async Task<SaidaDetailDto?> BuscarPorIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        using var multi = await connection.QueryMultipleAsync(
            "sp_BuscarSaidaPorId",
            new { id_saida = id },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);

        var cabecalho = await multi.ReadSingleOrDefaultAsync<SaidaCabecalhoRowDto>();
        if (cabecalho is null) return null;

        var itens = (await multi.ReadAsync<SaidaItemRowDto>()).ToList();

        return new SaidaDetailDto
        {
            IdSaida = cabecalho.IdSaida,
            DataSaida = cabecalho.DataSaida,
            Observacao = cabecalho.Observacao,
            IdSetor = cabecalho.IdSetor,
            Setor = cabecalho.Setor,
            Itens = itens.Select(x => new SaidaItemDto
            {
                IdItemSaida = x.IdItemSaida,
                IdProduto = x.IdProduto,
                Produto = x.Produto,
                UnidadeMedida = x.UnidadeMedida,
                Quantidade = x.Quantidade,
                PrecoMedioUnitario = x.PrecoMedioUnitario,
                ValorTotal = x.ValorTotal
            })
        };
    }

    public async Task<int> RegistrarAsync(RegistrarSaidaDto dto)
    {
        using var connection = _connectionFactory.CreateConnection();

        using var dt = new DataTable();
        dt.Columns.Add("id_produto", typeof(int));
        dt.Columns.Add("quantidade", typeof(decimal));

        foreach (var item in dto.Itens)
            dt.Rows.Add(item.IdProduto, item.Quantidade);

        var param = new DynamicParameters();
        param.Add("@id_setor", dto.IdSetor);
        param.Add("@observacao", dto.Observacao);
        param.Add("@itens", dt.AsTableValuedParameter("TVP_ItensSaida"));

        var result = await connection.QuerySingleAsync<IdSaidaCriadaRow>(
            "sp_RegistrarSaida",
            param,
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);

        return result.IdSaidaCriada;
    }

    private sealed class SaidaListItemRowDto
    {
        public int IdSaida { get; set; }
        public DateTime DataSaida { get; set; }
        public string? Observacao { get; set; }
        public int IdSetor { get; set; }
        public string Setor { get; set; } = string.Empty;
        public int QtdItens { get; set; }
        public decimal? ValorTotal { get; set; }
        public int TotalRegistros { get; set; }
    }

    private sealed class SaidaCabecalhoRowDto
    {
        public int IdSaida { get; set; }
        public DateTime DataSaida { get; set; }
        public string? Observacao { get; set; }
        public int IdSetor { get; set; }
        public string Setor { get; set; } = string.Empty;
    }

    private sealed class SaidaItemRowDto
    {
        public int IdItemSaida { get; set; }
        public int IdProduto { get; set; }
        public string Produto { get; set; } = string.Empty;
        public string UnidadeMedida { get; set; } = string.Empty;
        public decimal Quantidade { get; set; }
        public decimal PrecoMedioUnitario { get; set; }
        public decimal ValorTotal { get; set; }
    }

    private sealed class IdSaidaCriadaRow
    {
        public int IdSaidaCriada { get; set; }
    }
}
