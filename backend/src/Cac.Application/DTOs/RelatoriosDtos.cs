namespace Cac.Application.DTOs;

// R1 — Consumo por Setor (sp_Relatorio_ConsumoPorSetor)
public sealed class ConsumoPorSetorQueryDto
{
    public int? IdSetor { get; set; }
    public int? IdGrupo { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
}

public sealed class ConsumoPorSetorItemDto
{
    public int IdSetor { get; set; }
    public string Setor { get; set; } = string.Empty;
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public decimal QtdConsumida { get; set; }
    public decimal ValorConsumido { get; set; }
}

// R2 — Ficha do Produto (sp_Relatorio_FichaProduto)
public sealed class FichaProdutoQueryDto
{
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
}

public sealed class FichaProdutoItemDto
{
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string TipoMovimento { get; set; } = string.Empty;
    public DateTime DataMovimento { get; set; }
    public decimal Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
    public decimal ValorTotal { get; set; }
    public string FornecedorOuSetor { get; set; } = string.Empty;
    public string? Referencia { get; set; }
}

// R3 — Fornecedores por Produto (sp_Relatorio_FornecedoresPorProduto)
public sealed class FornecedoresPorProdutoQueryDto
{
    public int? IdProduto { get; set; }
}

public sealed class FornecedoresPorProdutoItemDto
{
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public int IdFornecedor { get; set; }
    public string Fornecedor { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public bool AssociacaoAtiva { get; set; }
}

// R4 — Produtos em Falta (sp_Relatorio_ProdutosEmFalta)
public sealed class ProdutosEmFaltaQueryDto
{
    public int? IdGrupo { get; set; }
}

public sealed class ProdutosEmFaltaItemDto
{
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public string UnidadeMedida { get; set; } = string.Empty;
    public decimal SaldoAtual { get; set; }
    public decimal EstoqueMinimo { get; set; }
    public decimal QtdEmFalta { get; set; }
    public decimal PrecoMedio { get; set; }
}

// R5 — Menor Preço por Produto (sp_Relatorio_MenorPrecoPorProduto)
public sealed class MenorPrecoPorProdutoQueryDto
{
    public int? IdProduto { get; set; }
}

public sealed class MenorPrecoPorProdutoItemDto
{
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public int IdFornecedor { get; set; }
    public string Fornecedor { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public decimal MenorPreco { get; set; }
    public DateTime DataUltimaCompra { get; set; }
}

// R6 — Produtos Mais Demandados (sp_ProdutosMaisDemandados)
public sealed class ProdutosMaisDemandadosQueryDto
{
    public int TopN { get; set; } = 10;
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public int? IdGrupo { get; set; }
    public int? IdSetor { get; set; }
    public string Criterio { get; set; } = "VALOR";
}

public sealed class ProdutosMaisDemandadosItemDto
{
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public string UnidadeMedida { get; set; } = string.Empty;
    public decimal QtdTotalConsumida { get; set; }
    public decimal ValorTotalConsumido { get; set; }
    public int SetoresConsumidores { get; set; }
    public int NumSaidas { get; set; }
    public DateTime? PrimeiraSaida { get; set; }
    public DateTime? UltimaSaida { get; set; }
    public decimal SaldoAtual { get; set; }
    public decimal EstoqueMinimo { get; set; }
    public string StatusEstoque { get; set; } = string.Empty;
}

// R7 — Comparativo de Preços (sp_Relatorio_ComparativoPrecos)
public sealed class ComparativoPrecosQueryDto
{
    public int? IdProduto { get; set; }
    public decimal? MinPctAcimaDoMenor { get; set; }
}

public sealed class ComparativoPrecosItemDto
{
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public int IdFornecedor { get; set; }
    public string Fornecedor { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public decimal UltimoPreco { get; set; }
    public DateTime DataUltimaCompra { get; set; }
    public decimal QtdUltimaCompra { get; set; }
    public decimal MenorPreco { get; set; }
    public decimal PrecoMedio { get; set; }
    public int QtdFornecedores { get; set; }
    public decimal DeltaVsMenor { get; set; }
    public decimal? PctAcimaDoMenor { get; set; }
    public decimal? PctVsMedia { get; set; }
    public string Classificacao { get; set; } = string.Empty;
}

// R8 — Curva ABC (sp_Relatorio_CurvaABC)
public sealed class CurvaAbcQueryDto
{
    public string? Classe { get; set; }
}

public sealed class CurvaAbcItemDto
{
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public decimal QtdTotalConsumida { get; set; }
    public decimal ValorTotalConsumido { get; set; }
    public decimal PctIndividual { get; set; }
    public decimal PctAcumulado { get; set; }
    public string ClasseAbc { get; set; } = string.Empty;
}

// R9 — Histórico de Preços (sp_Relatorio_HistoricoPrecos)
public sealed class HistoricoPrecosQueryDto
{
    public int? IdFornecedor { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
}

public sealed class HistoricoPrecosItemDto
{
    public int IdProduto { get; set; }
    public string Produto { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public int IdFornecedor { get; set; }
    public string Fornecedor { get; set; } = string.Empty;
    public DateTime DataEntrada { get; set; }
    public decimal PrecoUnitario { get; set; }
    public decimal Quantidade { get; set; }
    public decimal? MediaMovel3Compras { get; set; }
    public decimal? PrecoCompraAnterior { get; set; }
    public decimal? DeltaVsAnterior { get; set; }
}
