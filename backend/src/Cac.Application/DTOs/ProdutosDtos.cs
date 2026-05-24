namespace Cac.Application.DTOs;

public sealed class ProdutoListItemDto
{
    public int IdProduto { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string UnidadeMedida { get; set; } = string.Empty;
    public decimal Saldo { get; set; }
    public decimal EstoqueMinimo { get; set; }
    public decimal PrecoMedio { get; set; }
    public bool Ativo { get; set; }
    public int IdGrupo { get; set; }
    public string GrupoNome { get; set; } = string.Empty;
    public string StatusEstoque { get; set; } = string.Empty;
}

public sealed class ProdutoDetailDto
{
    public int IdProduto { get; set; }
    public int IdGrupo { get; set; }
    public string GrupoNome { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string UnidadeMedida { get; set; } = string.Empty;
    public decimal EstoqueMinimo { get; set; }
    public decimal Saldo { get; set; }
    public decimal PrecoMedio { get; set; }
    public bool Ativo { get; set; }
}

public sealed class ProdutoListQueryDto
{
    public bool? Ativo { get; set; }
    public int? IdGrupo { get; set; }
    public bool? ApenasEmFalta { get; set; }
    public string? Busca { get; set; }
    public int Pagina { get; set; } = 1;
    public int TamanhoPagina { get; set; } = 10;
}

public sealed class ProdutoCreateDto
{
    public int IdGrupo { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string UnidadeMedida { get; set; } = string.Empty;
    public decimal EstoqueMinimo { get; set; } = 0;
}

public sealed class ProdutoUpdateDto
{
    public int IdGrupo { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string UnidadeMedida { get; set; } = string.Empty;
    public decimal EstoqueMinimo { get; set; } = 0;
}
