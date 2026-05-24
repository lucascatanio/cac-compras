using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/perfis")]
[Authorize(Roles = "TI")]
public sealed class PerfisController : ControllerBase
{
    private readonly PerfilService _service;

    public PerfisController(PerfilService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PerfilListItemDto>>> Listar()
    {
        var response = await _service.ListarAsync();
        return Ok(response);
    }
}
