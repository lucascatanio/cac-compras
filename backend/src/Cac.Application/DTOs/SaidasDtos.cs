namespace Cac.Application.DTOs;

public sealed class SaidaListItemDto
{
    public int IdSaida { get; set; }
    public DateTime DataSaida { get; set; }
    public string? Observacao { get; set; }
    public int IdSetor { get; set; }
    public string Setor { get; set; } = string.Empty;
    public int QtdItens { get; set; }
    public decimal? ValorTotal { get; set; }
}

public sealed class SaidaItemDto
{
    public int IdItemSaida { get; set; }
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string UnidadeMedida { get; set; } = string.Empty;
    public decimal Quantidade { get; set; }
    public decimal PrecoMedioUnitario { get; set; }
    public decimal ValorTotal { get; set; }
}

public sealed class SaidaDetailDto
{
    public int IdSaida { get; set; }
    public DateTime DataSaida { get; set; }
    public string? Observacao { get; set; }
    public int IdSetor { get; set; }
    public string Setor { get; set; } = string.Empty;
    public IEnumerable<SaidaItemDto> Itens { get; set; } = [];
}

public sealed class SaidaListQueryDto
{
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public int? IdSetor { get; set; }
    public int Pagina { get; set; } = 1;
    public int TamanhoPagina { get; set; } = 10;
}

public sealed class ItemSaidaRequestDto
{
    public int IdProduto { get; set; }
    public decimal Quantidade { get; set; }
}

public sealed class RegistrarSaidaDto
{
    public int IdSetor { get; set; }
    public string? Observacao { get; set; }
    public List<ItemSaidaRequestDto> Itens { get; set; } = [];
}
