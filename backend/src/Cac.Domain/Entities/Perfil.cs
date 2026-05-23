namespace Cac.Domain.Entities;

public sealed class Perfil
{
    public int IdPerfil { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nome { get; init; } = string.Empty;
    public string? Descricao { get; init; }
}