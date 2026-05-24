using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/grupos")]
[Authorize]
public sealed class GruposController : ControllerBase
{
    private readonly GrupoService _grupoService;

    public GruposController(GrupoService grupoService)
    {
        _grupoService = grupoService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? busca)
    {
        var response = await _grupoService.ListarAsync(busca);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> BuscarPorId([FromRoute] int id)
    {
        var response = await _grupoService.BuscarPorIdAsync(id);

        if (response is null)
            return NotFound(new { erro = "Grupo nao encontrado." });

        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "ALMOXARIFE,GERENTE_COMPRAS,TI")]
    public async Task<IActionResult> Cadastrar([FromBody] GrupoCreateRequest request)
    {
        var id = await _grupoService.CadastrarAsync(request);

        return CreatedAtAction(
            nameof(BuscarPorId),
            new { id },
            new CreatedIdResponse(id)
        );
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ALMOXARIFE,GERENTE_COMPRAS,TI")]
    public async Task<IActionResult> Editar([FromRoute] int id, [FromBody] GrupoUpdateRequest request)
    {
        await _grupoService.EditarAsync(id, request);
        return NoContent();
    }
}