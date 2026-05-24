using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/auditoria")]
[Authorize(Roles = "TI")]
public sealed class AuditoriaController : ControllerBase
{
    private readonly AuditoriaService _service;

    public AuditoriaController(AuditoriaService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<AuditoriaItemDto>>> Listar([FromQuery] AuditoriaListQueryDto query)
    {
        var result = await _service.ListarAsync(query);
        return Ok(result);
    }
}
