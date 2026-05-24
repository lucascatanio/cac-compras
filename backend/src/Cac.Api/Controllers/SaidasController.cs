using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/saidas")]
[Authorize]
public sealed class SaidasController : ControllerBase
{
    private const string RolesAcesso = "ALMOXARIFE,GESTOR_SETOR,GERENTE_COMPRAS,TI";

    private readonly SaidaService _service;

    public SaidasController(SaidaService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = RolesAcesso)]
    public async Task<ActionResult<PagedResultDto<SaidaListItemDto>>> Listar([FromQuery] SaidaListQueryDto query)
    {
        var result = await _service.ListarAsync(query);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RolesAcesso)]
    public async Task<ActionResult<SaidaDetailDto>> BuscarPorId(int id)
    {
        var saida = await _service.BuscarPorIdAsync(id);

        if (saida is null)
        {
            return NotFound(new { erro = "Saída não encontrada." });
        }

        return Ok(saida);
    }

    [HttpPost]
    [Authorize(Roles = RolesAcesso)]
    public async Task<ActionResult> Registrar([FromBody] RegistrarSaidaDto dto)
    {
        var id = await _service.RegistrarAsync(dto);

        return CreatedAtAction(
            nameof(BuscarPorId),
            new { id },
            new { id });
    }
}
