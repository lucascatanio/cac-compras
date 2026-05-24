namespace Cac.Domain.Entities;

public sealed class Grupo
{
    public int IdGrupo { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public int? QtdProdutosAtivos { get; set; }
}