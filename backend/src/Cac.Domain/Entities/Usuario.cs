namespace Cac.Domain.Entities;

public sealed class Usuario
{
    public int IdUsuario { get; init; }
    public string Username { get; init; } = string.Empty;
    public string SenhaHash { get; init; } = string.Empty;
    public string NomeCompleto { get; init; } = string.Empty;
    public string? Email { get; init; }
    public bool Ativo { get; init; }
    public string PerfilCodigo { get; init; } = string.Empty;
    public string PerfilNome { get; init; } = string.Empty;
}