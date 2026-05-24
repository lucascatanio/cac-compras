namespace Cac.Application.DTOs;

public sealed class EntradaListItemDto
{
    public int IdEntrada { get; set; }
    public DateTime DataEntrada { get; set; }
    public string? NumeroNotaFiscal { get; set; }
    public string? Observacao { get; set; }
    public int IdFornecedor { get; set; }
    public string Fornecedor { get; set; } = string.Empty;
    public int QtdItens { get; set; }
    public decimal? ValorTotal { get; set; }
}

public sealed class EntradaItemDto
{
    public int IdItemEntrada { get; set; }
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string UnidadeMedida { get; set; } = string.Empty;
    public decimal Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
    public decimal ValorTotal { get; set; }
}

public sealed class EntradaDetailDto
{
    public int IdEntrada { get; set; }
    public DateTime DataEntrada { get; set; }
    public string? NumeroNotaFiscal { get; set; }
    public string? Observacao { get; set; }
    public int IdFornecedor { get; set; }
    public string Fornecedor { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public IEnumerable<EntradaItemDto> Itens { get; set; } = [];
}

public sealed class EntradaListQueryDto
{
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public int? IdFornecedor { get; set; }
    public int Pagina { get; set; } = 1;
    public int TamanhoPagina { get; set; } = 10;
}

public sealed class ItemEntradaRequestDto
{
    public int IdProduto { get; set; }
    public decimal Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
}

public sealed class RegistrarEntradaDto
{
    public int IdFornecedor { get; set; }
    public string? NumeroNotaFiscal { get; set; }
    public string? Observacao { get; set; }
    public List<ItemEntradaRequestDto> Itens { get; set; } = [];
}
