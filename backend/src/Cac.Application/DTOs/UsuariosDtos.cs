namespace Cac.Application.DTOs;

public sealed class UsuarioListItemDto
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
}

public sealed class UsuarioDetailDto
{
    public int IdUsuario { get; set; }
    public string Username { get; set; } = string.Empty;
    public string NomeCompleto { get; set; } = string.Empty;
    public string? Email { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime? UltimoLogin { get; set; }
    public int IdPerfil { get; set; }
    public string PerfilCodigo { get; set; } = string.Empty;
    public string PerfilNome { get; set; } = string.Empty;
}

public sealed class UsuarioListQueryDto
{
    public bool? Ativo { get; set; }
    public string? CodigoPerfil { get; set; }
    public string? Busca { get; set; }
    public int Pagina { get; set; } = 1;
    public int TamanhoPagina { get; set; } = 10;
}

public sealed class UsuarioCreateDto
{
    public string Username { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string NomeCompleto { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string CodigoPerfil { get; set; } = string.Empty;
}

public sealed class UsuarioUpdateDto
{
    public string NomeCompleto { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string CodigoPerfil { get; set; } = string.Empty;
}

public sealed class AlterarSenhaDto
{
    public string NovaSenha { get; set; } = string.Empty;
}

public sealed class PerfilListItemDto
{
    public int IdPerfil { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
}
