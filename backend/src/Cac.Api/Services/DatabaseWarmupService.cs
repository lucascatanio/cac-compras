using Cac.Infrastructure.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Cac.Api.Services;

public sealed class DatabaseWarmupService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseWarmupService> _logger;

    public DatabaseWarmupService(IServiceProvider serviceProvider, ILogger<DatabaseWarmupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var connectionFactory = scope.ServiceProvider.GetRequiredService<IDbConnectionFactory>();

        try
        {
            using var connection = connectionFactory.CreateConnection();

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
                    commandTimeout: 60,
                    cancellationToken: cancellationToken
                )
            );

            _logger.LogInformation("Warm-up de conexão com o banco executado com sucesso.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha no warm-up inicial do banco. A aplicação continuará iniciando.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}