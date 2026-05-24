using Cac.Application.Interfaces;
using Cac.Domain.Entities;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class GrupoRepository : IGrupoRepository
{
    private const int CommandTimeoutInSeconds = 60;

    private readonly IDbConnectionFactory _connectionFactory;

    public GrupoRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // Parametro: @busca VARCHAR(100) = NULL
    // Retorna: id_grupo, nome, descricao, qtd_produtos_ativos
    public async Task<IReadOnlyList<Grupo>> ListarAsync(string? busca)
    {
        using var connection = _connectionFactory.CreateConnection();

        var result = await connection.QueryAsync<Grupo>(
            "sp_ListarGrupos",
            new
            {
                busca
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );

        return result.ToList();
    }

    // Parametro: @id_grupo INT
    // Retorna: id_grupo, nome, descricao
    public async Task<Grupo?> BuscarPorIdAsync(int idGrupo)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Grupo>(
            "sp_BuscarGrupoPorId",
            new
            {
                id_grupo = idGrupo
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );
    }

    // Parametros: @nome VARCHAR(100), @descricao VARCHAR(200) = NULL
    // Retorna: id_grupo_criado
    public async Task<int> CadastrarAsync(string nome, string? descricao)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            "sp_CadastrarGrupo",
            new
            {
                nome,
                descricao
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );
    }

    // Parametros: @id_grupo INT, @nome VARCHAR(100), @descricao VARCHAR(200) = NULL
    public async Task EditarAsync(int idGrupo, string nome, string? descricao)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_EditarGrupo",
            new
            {
                id_grupo = idGrupo,
                nome,
                descricao
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );
    }
}