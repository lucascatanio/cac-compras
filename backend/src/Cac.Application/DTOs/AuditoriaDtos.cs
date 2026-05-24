namespace Cac.Application.DTOs;

public sealed class AuditoriaItemDto
{
    public int IdLog { get; set; }
    public string Tabela { get; set; } = string.Empty;
    public string Operacao { get; set; } = string.Empty;
    public int IdRegistro { get; set; }
    public string? DadosAnteriores { get; set; }
    public string? DadosNovos { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public DateTime DataHora { get; set; }
}

public sealed class AuditoriaListQueryDto
{
    public string? Tabela { get; set; }
    public string? Operacao { get; set; }
    public int? IdRegistro { get; set; }
    public string? Usuario { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public int Pagina { get; set; } = 1;
    public int TamanhoPagina { get; set; } = 20;
}
