using Cac.Application.DTOs;
using Cac.Application.Interfaces;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class FornecedorRepository : IFornecedorRepository
{
    private const int CommandTimeoutInSeconds = 60;
    private readonly IDbConnectionFactory _connectionFactory;

    public FornecedorRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResultDto<FornecedorListItemDto>> ListarAsync(FornecedorListQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();

        var rows = (await connection.QueryAsync<FornecedorListItemRowDto>(
            "sp_ListarFornecedores",
            new
            {
                ativo = query.Ativo,
                busca = query.Busca,
                pagina = query.Pagina,
                tamanho_pagina = query.TamanhoPagina
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds)).ToList();

        var total = rows.FirstOrDefault()?.TotalRegistros ?? 0;

        return new PagedResultDto<FornecedorListItemDto>
        {
            Itens = rows.Select(x => new FornecedorListItemDto
            {
                IdFornecedor = x.IdFornecedor,
                RazaoSocial = x.RazaoSocial,
                Cnpj = x.Cnpj,
                Telefone = x.Telefone,
                Email = x.Email,
                Cidade = x.Cidade,
                Uf = x.Uf,
                Ativo = x.Ativo
            }),
            Total = total,
            Pagina = query.Pagina,
            TamanhoPagina = query.TamanhoPagina
        };
    }

    public async Task<FornecedorDetailDto?> BuscarPorIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<FornecedorDetailDto>(
            "sp_BuscarFornecedorPorId",
            new { id_fornecedor = id },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task<int> CadastrarAsync(FornecedorCreateDto dto)
    {
        using var connection = _connectionFactory.CreateConnection();

        var result = await connection.QuerySingleAsync<IdFornecedorCriadoRow>(
            "sp_CadastrarFornecedor",
            new
            {
                razao_social = dto.RazaoSocial,
                cnpj = dto.Cnpj,
                telefone = dto.Telefone,
                email = dto.Email,
                logradouro = dto.Logradouro,
                numero = dto.Numero,
                complemento = dto.Complemento,
                bairro = dto.Bairro,
                cidade = dto.Cidade,
                uf = dto.Uf,
                cep = dto.Cep
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);

        return result.IdFornecedorCriado;
    }

    private sealed class IdFornecedorCriadoRow
    {
        public int IdFornecedorCriado { get; set; }
    }

    public async Task EditarAsync(int id, FornecedorUpdateDto dto)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_EditarFornecedor",
            new
            {
                id_fornecedor = id,
                razao_social = dto.RazaoSocial,
                telefone = dto.Telefone,
                email = dto.Email,
                logradouro = dto.Logradouro,
                numero = dto.Numero,
                complemento = dto.Complemento,
                bairro = dto.Bairro,
                cidade = dto.Cidade,
                uf = dto.Uf,
                cep = dto.Cep
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    public async Task DefinirAtivoAsync(int id, bool ativo)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_DefinirAtivoFornecedor",
            new
            {
                id_fornecedor = id,
                ativo
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    private sealed class FornecedorListItemRowDto
    {
        public int IdFornecedor { get; set; }
        public string RazaoSocial { get; set; } = string.Empty;
        public string Cnpj { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public string? Cidade { get; set; }
        public string? Uf { get; set; }
        public bool Ativo { get; set; }
        public int TotalRegistros { get; set; }
    }
}