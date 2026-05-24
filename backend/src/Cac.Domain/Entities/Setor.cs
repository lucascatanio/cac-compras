namespace Cac.Domain.Entities;

public sealed class Setor
{
    public int IdSetor { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; }
}
