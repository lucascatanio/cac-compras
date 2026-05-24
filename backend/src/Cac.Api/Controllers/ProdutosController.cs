using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/produtos")]
[Authorize]
public sealed class ProdutosController : ControllerBase
{
    private const string RolesLeitura = "COMPRADOR,ALMOXARIFE,GESTOR_SETOR,GERENTE_COMPRAS,TI";
    private const string RolesEscrita = "ALMOXARIFE,GERENTE_COMPRAS,TI";

    private readonly ProdutoService _service;

    public ProdutosController(ProdutoService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = RolesLeitura)]
    public async Task<ActionResult<PagedResultDto<ProdutoListItemDto>>> Listar([FromQuery] ProdutoListQueryDto query)
    {
        var response = await _service.ListarAsync(query);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RolesLeitura)]
    public async Task<ActionResult<ProdutoDetailDto>> BuscarPorId(int id)
    {
        var produto = await _service.BuscarPorIdAsync(id);

        if (produto is null)
        {
            return NotFound(new { erro = "Produto não encontrado." });
        }

        return Ok(produto);
    }

    [HttpPost]
    [Authorize(Roles = RolesEscrita)]
    public async Task<ActionResult> Cadastrar([FromBody] ProdutoCreateDto dto)
    {
        var id = await _service.CadastrarAsync(dto);

        return CreatedAtAction(
            nameof(BuscarPorId),
            new { id },
            new { id });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RolesEscrita)]
    public async Task<IActionResult> Editar(int id, [FromBody] ProdutoUpdateDto dto)
    {
        var existente = await _service.BuscarPorIdAsync(id);

        if (existente is null)
        {
            return NotFound(new { erro = "Produto não encontrado." });
        }

        await _service.EditarAsync(id, dto);
        return NoContent();
    }

    [HttpPatch("{id:int}/ativo")]
    [Authorize(Roles = RolesEscrita)]
    public async Task<IActionResult> DefinirAtivo(int id, [FromBody] DefinirAtivoRequestDto dto)
    {
        var existente = await _service.BuscarPorIdAsync(id);

        if (existente is null)
        {
            return NotFound(new { erro = "Produto não encontrado." });
        }

        await _service.DefinirAtivoAsync(id, dto.Ativo);
        return NoContent();
    }
}
