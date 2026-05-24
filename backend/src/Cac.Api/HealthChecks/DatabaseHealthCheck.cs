using Cac.Infrastructure.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Data;

namespace Cac.Api.HealthChecks;

public sealed class DatabaseHealthCheck : IHealthCheck
{
    private readonly IDbConnectionFactory _connectionFactory;

    public DatabaseHealthCheck(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = _connectionFactory.CreateConnection();

            if (connection is SqlConnection sqlConnection)
            {
                await sqlConnection.OpenAsync(cancellationToken);
            }
            else
            {
                connection.Open();
            }

            await connection.ExecuteScalarAsync<int>(
                new CommandDefinition(
                    "SELECT 1",
                    commandType: CommandType.Text,
                    commandTimeout: 30,
                    cancellationToken: cancellationToken
                )
            );

            return HealthCheckResult.Healthy("Banco de dados acessível.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Banco de dados indisponível.", ex);
        }
    }
}