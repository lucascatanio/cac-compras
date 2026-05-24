using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/setores")]
[Authorize]
public sealed class SetoresController : ControllerBase
{
    private const string RolesEscrita = "GERENTE_COMPRAS,TI";

    private readonly SetorService _service;

    public SetoresController(SetorService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] SetorListQueryDto query)
    {
        var response = await _service.ListarAsync(query);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> BuscarPorId([FromRoute] int id)
    {
        var setor = await _service.BuscarPorIdAsync(id);

        if (setor is null)
            return NotFound(new { erro = "Setor não encontrado." });

        return Ok(setor);
    }

    [HttpPost]
    [Authorize(Roles = RolesEscrita)]
    public async Task<IActionResult> Cadastrar([FromBody] SetorCreateDto dto)
    {
        var id = await _service.CadastrarAsync(dto);

        return CreatedAtAction(
            nameof(BuscarPorId),
            new { id },
            new { id });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RolesEscrita)]
    public async Task<IActionResult> Editar([FromRoute] int id, [FromBody] SetorUpdateDto dto)
    {
        var existente = await _service.BuscarPorIdAsync(id);

        if (existente is null)
            return NotFound(new { erro = "Setor não encontrado." });

        await _service.EditarAsync(id, dto);
        return NoContent();
    }

    [HttpPatch("{id:int}/ativo")]
    [Authorize(Roles = RolesEscrita)]
    public async Task<IActionResult> DefinirAtivo([FromRoute] int id, [FromBody] DefinirAtivoRequestDto dto)
    {
        var existente = await _service.BuscarPorIdAsync(id);

        if (existente is null)
            return NotFound(new { erro = "Setor não encontrado." });

        await _service.DefinirAtivoAsync(id, dto.Ativo);
        return NoContent();
    }
}
