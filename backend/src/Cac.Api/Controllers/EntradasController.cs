using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/entradas")]
[Authorize]
public sealed class EntradasController : ControllerBase
{
    private const string RolesAcesso = "COMPRADOR,ALMOXARIFE,GERENTE_COMPRAS,TI";

    private readonly EntradaService _service;

    public EntradasController(EntradaService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = RolesAcesso)]
    public async Task<ActionResult<PagedResultDto<EntradaListItemDto>>> Listar([FromQuery] EntradaListQueryDto query)
    {
        var result = await _service.ListarAsync(query);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RolesAcesso)]
    public async Task<ActionResult<EntradaDetailDto>> BuscarPorId(int id)
    {
        var entrada = await _service.BuscarPorIdAsync(id);

        if (entrada is null)
        {
            return NotFound(new { erro = "Entrada não encontrada." });
        }

        return Ok(entrada);
    }

    [HttpPost]
    [Authorize(Roles = RolesAcesso)]
    public async Task<ActionResult> Registrar([FromBody] RegistrarEntradaDto dto)
    {
        var id = await _service.RegistrarAsync(dto);

        return CreatedAtAction(
            nameof(BuscarPorId),
            new { id },
            new { id });
    }
}
