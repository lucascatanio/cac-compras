using Cac.Application.DTOs;
using Cac.Application.Interfaces;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class RelatorioRepository : IRelatorioRepository
{
    private const int CommandTimeoutInSeconds = 60;
    private readonly IDbConnectionFactory _connectionFactory;

    public RelatorioRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<ConsumoPorSetorItemDto>> ConsumoPorSetorAsync(ConsumoPorSetorQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ConsumoPorSetorItemDto>(
            "sp_Relatorio_ConsumoPorSetor",
            new
            {
                id_setor = query.IdSetor,
                id_grupo = query.IdGrupo,
                data_inicio = query.DataInicio,
                data_fim = query.DataFim
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<IEnumerable<FichaProdutoItemDto>> FichaProdutoAsync(int idProduto, FichaProdutoQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<FichaProdutoItemDto>(
            "sp_Relatorio_FichaProduto",
            new
            {
                id_produto = idProduto,
                data_inicio = query.DataInicio,
                data_fim = query.DataFim
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<IEnumerable<FornecedoresPorProdutoItemDto>> FornecedoresPorProdutoAsync(FornecedoresPorProdutoQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<FornecedoresPorProdutoItemDto>(
            "sp_Relatorio_FornecedoresPorProduto",
            new { id_produto = query.IdProduto },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<IEnumerable<ProdutosEmFaltaItemDto>> ProdutosEmFaltaAsync(ProdutosEmFaltaQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ProdutosEmFaltaItemDto>(
            "sp_Relatorio_ProdutosEmFalta",
            new { id_grupo = query.IdGrupo },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<IEnumerable<MenorPrecoPorProdutoItemDto>> MenorPrecoPorProdutoAsync(MenorPrecoPorProdutoQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MenorPrecoPorProdutoItemDto>(
            "sp_Relatorio_MenorPrecoPorProduto",
            new { id_produto = query.IdProduto },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<IEnumerable<ProdutosMaisDemandadosItemDto>> ProdutosMaisDemandadosAsync(ProdutosMaisDemandadosQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ProdutosMaisDemandadosItemDto>(
            "sp_ProdutosMaisDemandados",
            new
            {
                top_n = query.TopN,
                data_inicio = query.DataInicio,
                data_fim = query.DataFim,
                id_grupo = query.IdGrupo,
                id_setor = query.IdSetor,
                criterio = query.Criterio
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<IEnumerable<ComparativoPrecosItemDto>> ComparativoPrecosAsync(ComparativoPrecosQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ComparativoPrecosItemDto>(
            "sp_Relatorio_ComparativoPrecos",
            new
            {
                id_produto = query.IdProduto,
                min_pct_acima_menor = query.MinPctAcimaDoMenor
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<IEnumerable<CurvaAbcItemDto>> CurvaAbcAsync(CurvaAbcQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<CurvaAbcItemDto>(
            "sp_Relatorio_CurvaABC",
            new { classe = query.Classe },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<IEnumerable<HistoricoPrecosItemDto>> HistoricoPrecosAsync(int idProduto, HistoricoPrecosQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<HistoricoPrecosItemDto>(
            "sp_Relatorio_HistoricoPrecos",
            new
            {
                id_produto = idProduto,
                id_fornecedor = query.IdFornecedor,
                data_inicio = query.DataInicio,
                data_fim = query.DataFim
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }
}
