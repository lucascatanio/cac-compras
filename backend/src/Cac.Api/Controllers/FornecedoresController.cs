using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/fornecedores")]
[Authorize]
public sealed class FornecedoresController : ControllerBase
{
    private const string RolesLeitura = "COMPRADOR,ALMOXARIFE,GERENTE_COMPRAS,TI";
    private const string RolesEscrita = "COMPRADOR,GERENTE_COMPRAS,TI";

    private readonly FornecedorService _service;

    public FornecedoresController(FornecedorService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = RolesLeitura)]
    public async Task<ActionResult<PagedResultDto<FornecedorListItemDto>>> Listar([FromQuery] FornecedorListQueryDto query)
    {
        var response = await _service.ListarAsync(query);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RolesLeitura)]
    public async Task<ActionResult<FornecedorDetailDto>> BuscarPorId(int id)
    {
        var fornecedor = await _service.BuscarPorIdAsync(id);

        if (fornecedor is null)
        {
            return NotFound(new { erro = "Fornecedor não encontrado." });
        }

        return Ok(fornecedor);
    }

    [HttpPost]
    [Authorize(Roles = RolesEscrita)]
    public async Task<ActionResult> Cadastrar([FromBody] FornecedorCreateDto dto)
    {
        var id = await _service.CadastrarAsync(dto);

        return CreatedAtAction(
            nameof(BuscarPorId),
            new { id },
            new { id });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RolesEscrita)]
    public async Task<IActionResult> Editar(int id, [FromBody] FornecedorUpdateDto dto)
    {
        var existente = await _service.BuscarPorIdAsync(id);

        if (existente is null)
        {
            return NotFound(new { erro = "Fornecedor não encontrado." });
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
            return NotFound(new { erro = "Fornecedor não encontrado." });
        }

        await _service.DefinirAtivoAsync(id, dto.Ativo);
        return NoContent();
    }
}