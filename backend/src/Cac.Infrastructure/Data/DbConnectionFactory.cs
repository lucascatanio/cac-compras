using Microsoft.Data.SqlClient;
using System.Data;

namespace Cac.Infrastructure.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

public sealed class DbConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString)
        {
            ConnectTimeout = Math.Max(new SqlConnectionStringBuilder(connectionString).ConnectTimeout, 60),
            Pooling = true,
            MinPoolSize = 1,
            MaxPoolSize = 100
        };

        _connectionString = builder.ConnectionString;
    }

    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }
}