using System.ComponentModel.DataAnnotations;

namespace Cac.Application.DTOs;

public sealed record GrupoListItemDto(
    int IdGrupo,
    string Nome,
    string? Descricao,
    int QtdProdutosAtivos
);

public sealed record GrupoDetailDto(
    int IdGrupo,
    string Nome,
    string? Descricao
);

public sealed class GrupoCreateRequest
{
    [Required(ErrorMessage = "Nome e obrigatorio.")]
    [StringLength(100, ErrorMessage = "Nome deve ter no maximo 100 caracteres.")]
    public string Nome { get; set; } = string.Empty;

    [StringLength(200, ErrorMessage = "Descricao deve ter no maximo 200 caracteres.")]
    public string? Descricao { get; set; }
}

public sealed class GrupoUpdateRequest
{
    [Required(ErrorMessage = "Nome e obrigatorio.")]
    [StringLength(100, ErrorMessage = "Nome deve ter no maximo 100 caracteres.")]
    public string Nome { get; set; } = string.Empty;

    [StringLength(200, ErrorMessage = "Descricao deve ter no maximo 200 caracteres.")]
    public string? Descricao { get; set; }
}

public sealed record CreatedIdResponse(int Id);