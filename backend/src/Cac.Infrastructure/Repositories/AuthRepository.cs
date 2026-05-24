using Cac.Application.Interfaces;
using Cac.Domain.Entities;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class AuthRepository : IAuthRepository
{
    private const int CommandTimeoutInSeconds = 60;

    private readonly IDbConnectionFactory _connectionFactory;

    public AuthRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // Parâmetro: @username VARCHAR(50)
    // Retorna: id_usuario, username, senha_hash, nome_completo, email, ativo,
    //          perfil_codigo, perfil_nome
    public async Task<Usuario?> BuscarUsuarioPorUsernameAsync(string username)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Usuario>(
            "sp_BuscarUsuarioPorUsername",
            new { username },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );
    }


    // Parâmetro: @id_usuario INT
    public async Task RegistrarUltimoLoginAsync(int idUsuario)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_RegistrarUltimoLogin",
            new { id_usuario = idUsuario },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds
        );
    }
}