namespace Cac.Application.DTOs;

public sealed class FornecedorListItemDto
{
    public int IdFornecedor { get; set; }
    public string RazaoSocial { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Cidade { get; set; }
    public string? Uf { get; set; }
    public bool Ativo { get; set; }
}

public sealed class FornecedorDetailDto
{
    public int IdFornecedor { get; set; }
    public string RazaoSocial { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Logradouro { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public string? Cidade { get; set; }
    public string? Uf { get; set; }
    public string? Cep { get; set; }
    public bool Ativo { get; set; }
}

public sealed class FornecedorListQueryDto
{
    public bool? Ativo { get; set; }
    public string? Busca { get; set; }
    public int Pagina { get; set; } = 1;
    public int TamanhoPagina { get; set; } = 10;
}

public sealed class FornecedorCreateDto
{
    public string RazaoSocial { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Logradouro { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public string? Cidade { get; set; }
    public string? Uf { get; set; }
    public string? Cep { get; set; }
}

public sealed class FornecedorUpdateDto
{
    public string RazaoSocial { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Logradouro { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public string? Cidade { get; set; }
    public string? Uf { get; set; }
    public string? Cep { get; set; }
}

public sealed class DefinirAtivoRequestDto
{
    public bool Ativo { get; set; }
}

public sealed class PagedResultDto<T>
{
    public IEnumerable<T> Itens { get; set; } = [];
    public int Total { get; set; }
    public int Pagina { get; set; }
    public int TamanhoPagina { get; set; }
}