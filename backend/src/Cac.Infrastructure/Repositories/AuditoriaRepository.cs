using Cac.Application.DTOs;
using Cac.Application.Interfaces;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

// Procedure: sp_Auditoria_Listar (cac_database.sql)
public sealed class AuditoriaRepository : IAuditoriaRepository
{
    private const int CommandTimeoutInSeconds = 60;
    private readonly IDbConnectionFactory _connectionFactory;

    public AuditoriaRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResultDto<AuditoriaItemDto>> ListarAsync(AuditoriaListQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();

        var rows = (await connection.QueryAsync<AuditoriaListItemRowDto>(
            "sp_Auditoria_Listar",
            new
            {
                tabela = query.Tabela,
                operacao = query.Operacao,
                id_registro = query.IdRegistro,
                usuario = query.Usuario,
                data_inicio = query.DataInicio,
                data_fim = query.DataFim,
                pagina = query.Pagina,
                tamanho_pagina = query.TamanhoPagina
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds)).ToList();

        var total = rows.FirstOrDefault()?.TotalRegistros ?? 0;

        return new PagedResultDto<AuditoriaItemDto>
        {
            Itens = rows.Select(x => new AuditoriaItemDto
            {
                IdLog = x.IdLog,
                Tabela = x.Tabela,
                Operacao = x.Operacao,
                IdRegistro = x.IdRegistro,
                DadosAnteriores = x.DadosAnteriores,
                DadosNovos = x.DadosNovos,
                Usuario = x.Usuario,
                DataHora = x.DataHora
            }),
            Total = total,
            Pagina = query.Pagina,
            TamanhoPagina = query.TamanhoPagina
        };
    }

    private sealed class AuditoriaListItemRowDto
    {
        public int IdLog { get; set; }
        public string Tabela { get; set; } = string.Empty;
        public string Operacao { get; set; } = string.Empty;
        public int IdRegistro { get; set; }
        public string? DadosAnteriores { get; set; }
        public string? DadosNovos { get; set; }
        public string Usuario { get; set; } = string.Empty;
        public DateTime DataHora { get; set; }
        public int TotalRegistros { get; set; }
    }
}
