using Cac.Application.Interfaces;
using Cac.Domain.Entities;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class SetorRepository : ISetorRepository
{
    private const int CommandTimeoutInSeconds = 60;

    private readonly IDbConnectionFactory _connectionFactory;

    public SetorRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // sp_ListarSetores: @ativo BIT = NULL, @busca VARCHAR(100) = NULL
    // Retorna: id_setor, nome, descricao, ativo
    public async Task<IReadOnlyList<Setor>> ListarAsync(bool? ativo, string? busca)
    {
        using var connection = _connectionFactory.CreateConnection();

        var result = await connection.QueryAsync<Setor>(
            "sp_ListarSetores",
            new { ativo, busca },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );

        return result.ToList();
    }

    // sp_BuscarSetorPorId: @id_setor INT
    // Retorna: id_setor, nome, descricao, ativo
    public async Task<Setor?> BuscarPorIdAsync(int idSetor)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Setor>(
            "sp_BuscarSetorPorId",
            new { id_setor = idSetor },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );
    }

    // sp_CadastrarSetor: @nome VARCHAR(100), @descricao VARCHAR(200) = NULL
    // Retorna: id_setor_criado (SCOPE_IDENTITY)
    public async Task<int> CadastrarAsync(string nome, string? descricao)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            "sp_CadastrarSetor",
            new { nome, descricao },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );
    }

    // sp_EditarSetor: @id_setor INT, @nome VARCHAR(100), @descricao VARCHAR(200) = NULL
    public async Task EditarAsync(int idSetor, string nome, string? descricao)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_EditarSetor",
            new { id_setor = idSetor, nome, descricao },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );
    }

    // sp_DefinirAtivoSetor: @id_setor INT, @ativo BIT
    public async Task DefinirAtivoAsync(int idSetor, bool ativo)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_DefinirAtivoSetor",
            new { id_setor = idSetor, ativo },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );
    }
}
