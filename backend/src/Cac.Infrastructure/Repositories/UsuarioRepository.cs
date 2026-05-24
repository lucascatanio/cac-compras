using Cac.Application.DTOs;
using Cac.Application.Interfaces;
using Cac.Infrastructure.Data;
using Dapper;
using System.Data;

namespace Cac.Infrastructure.Repositories;

public sealed class UsuarioRepository : IUsuarioRepository
{
    private const int CommandTimeoutInSeconds = 60;
    private readonly IDbConnectionFactory _connectionFactory;

    public UsuarioRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // sp_ListarUsuarios: @ativo BIT=NULL, @codigo_perfil VARCHAR(30)=NULL, @busca VARCHAR(150)=NULL, @pagina INT=1, @tamanho_pagina INT=50
    // Retorna: id_usuario, username, nome_completo, email, ativo, data_criacao, ultimo_login, perfil_codigo, perfil_nome, total_registros
    public async Task<PagedResultDto<UsuarioListItemDto>> ListarAsync(UsuarioListQueryDto query)
    {
        using var connection = _connectionFactory.CreateConnection();

        var rows = (await connection.QueryAsync<UsuarioListItemRowDto>(
            "sp_ListarUsuarios",
            new
            {
                ativo = query.Ativo,
                codigo_perfil = query.CodigoPerfil,
                busca = query.Busca,
                pagina = query.Pagina,
                tamanho_pagina = query.TamanhoPagina
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds)).ToList();

        var total = rows.FirstOrDefault()?.TotalRegistros ?? 0;

        return new PagedResultDto<UsuarioListItemDto>
        {
            Itens = rows.Select(x => new UsuarioListItemDto
            {
                IdUsuario = x.IdUsuario,
                Username = x.Username,
                NomeCompleto = x.NomeCompleto,
                Email = x.Email,
                Ativo = x.Ativo,
                DataCriacao = x.DataCriacao,
                UltimoLogin = x.UltimoLogin,
                PerfilCodigo = x.PerfilCodigo,
                PerfilNome = x.PerfilNome
            }),
            Total = total,
            Pagina = query.Pagina,
            TamanhoPagina = query.TamanhoPagina
        };
    }

    // sp_BuscarUsuarioPorId: @id_usuario INT
    // Retorna: id_usuario, username, nome_completo, email, ativo, data_criacao, ultimo_login, id_perfil, perfil_codigo, perfil_nome
    public async Task<UsuarioDetailDto?> BuscarPorIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<UsuarioDetailDto>(
            "sp_BuscarUsuarioPorId",
            new { id_usuario = id },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    // sp_CadastrarUsuario: @username VARCHAR(50), @senha_hash VARCHAR(255), @nome_completo VARCHAR(150), @email VARCHAR(100)=NULL, @codigo_perfil VARCHAR(30)
    // Retorna: id_usuario_criado
    public async Task<int> CadastrarAsync(string username, string senhaHash, string nomeCompleto, string? email, string codigoPerfil)
    {
        using var connection = _connectionFactory.CreateConnection();

        var result = await connection.QuerySingleAsync<IdUsuarioCriadoRow>(
            "sp_CadastrarUsuario",
            new
            {
                username,
                senha_hash = senhaHash,
                nome_completo = nomeCompleto,
                email,
                codigo_perfil = codigoPerfil
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);

        return result.IdUsuarioCriado;
    }

    // sp_EditarUsuario: @id_usuario INT, @nome_completo VARCHAR(150), @email VARCHAR(100)=NULL, @codigo_perfil VARCHAR(30)
    public async Task EditarAsync(int id, string nomeCompleto, string? email, string codigoPerfil)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_EditarUsuario",
            new
            {
                id_usuario = id,
                nome_completo = nomeCompleto,
                email,
                codigo_perfil = codigoPerfil
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    // sp_AlterarSenhaUsuario: @id_usuario INT, @novo_senha_hash VARCHAR(255)
    public async Task AlterarSenhaAsync(int id, string novoSenhaHash)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_AlterarSenhaUsuario",
            new
            {
                id_usuario = id,
                novo_senha_hash = novoSenhaHash
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    // sp_DefinirAtivoUsuario: @id_usuario INT, @ativo BIT
    public async Task DefinirAtivoAsync(int id, bool ativo)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_DefinirAtivoUsuario",
            new { id_usuario = id, ativo },
            commandType: CommandType.StoredProcedure,
            commandTimeout: CommandTimeoutInSeconds);
    }

    private sealed class UsuarioListItemRowDto
    {
        public int IdUsuario { get; set; }
        public string Username { get; set; } = string.Empty;
        public string NomeCompleto { get; set; } = string.Empty;
        public string? Email { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime? UltimoLogin { get; set; }
        public string PerfilCodigo { get; set; } = string.Empty;
        public string PerfilNome { get; set; } = string.Empty;
        public int TotalRegistros { get; set; }
    }

    private sealed class IdUsuarioCriadoRow
    {
        public int IdUsuarioCriado { get; set; }
    }
}
