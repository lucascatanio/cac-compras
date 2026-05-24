using Microsoft.Data.SqlClient;
using System.Net;
using System.Text.Json;

namespace Cac.Api.Middleware;

public sealed class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (SqlException ex) when (IsConnectionTimeout(ex))
        {
            _logger.LogError(ex, "Timeout de conexão com o banco na requisição {Method} {Path}",
                context.Request.Method, context.Request.Path);

            await WriteErrorAsync(
                context,
                HttpStatusCode.ServiceUnavailable,
                "O banco de dados demorou para responder. Tente novamente em instantes.");
        }
        catch (SqlException ex) when (ex.Class >= 16)
        {
            await WriteErrorAsync(context, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado na requisição {Method} {Path}",
                context.Request.Method, context.Request.Path);

            await WriteErrorAsync(
                context,
                HttpStatusCode.InternalServerError,
                "Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }

    private static bool IsConnectionTimeout(SqlException ex)
    {
        return ex.Number == -2;
    }

    private static async Task WriteErrorAsync(HttpContext context, HttpStatusCode status, string message)
    {
        context.Response.StatusCode = (int)status;
        context.Response.ContentType = "application/json; charset=utf-8";
        context.Response.Headers.CacheControl = "no-cache";

        var body = JsonSerializer.Serialize(
            new { erro = message },
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        await context.Response.WriteAsync(body);
    }
}