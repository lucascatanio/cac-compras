using Cac.Application.DTOs;
using Cac.Application.Interfaces;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class PerfilRepository : IPerfilRepository
{
    private const int CommandTimeoutInSeconds = 60;
    private readonly IDbConnectionFactory _connectionFactory;

    public PerfilRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // sp_ListarPerfis: sem parâmetros
    // Retorna: id_perfil, codigo, nome, descricao
    public async Task<IReadOnlyList<PerfilListItemDto>> ListarAsync()
    {
        using var connection = _connectionFactory.CreateConnection();

        var result = await connection.QueryAsync<PerfilListItemDto>(
            "sp_ListarPerfis",
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);

        return result.ToList();
    }
}
