using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize(Roles = "TI")]
public sealed class UsuariosController : ControllerBase
{
    private readonly UsuarioService _service;

    public UsuariosController(UsuarioService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<UsuarioListItemDto>>> Listar([FromQuery] UsuarioListQueryDto query)
    {
        var response = await _service.ListarAsync(query);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioDetailDto>> BuscarPorId([FromRoute] int id)
    {
        var usuario = await _service.BuscarPorIdAsync(id);

        if (usuario is null)
            return NotFound(new { erro = "Usuário não encontrado." });

        return Ok(usuario);
    }

    [HttpPost]
    public async Task<ActionResult> Cadastrar([FromBody] UsuarioCreateDto dto)
    {
        var id = await _service.CadastrarAsync(dto);

        return CreatedAtAction(
            nameof(BuscarPorId),
            new { id },
            new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar([FromRoute] int id, [FromBody] UsuarioUpdateDto dto)
    {
        var existente = await _service.BuscarPorIdAsync(id);

        if (existente is null)
            return NotFound(new { erro = "Usuário não encontrado." });

        await _service.EditarAsync(id, dto);
        return NoContent();
    }

    [HttpPatch("{id:int}/senha")]
    public async Task<IActionResult> AlterarSenha([FromRoute] int id, [FromBody] AlterarSenhaDto dto)
    {
        var existente = await _service.BuscarPorIdAsync(id);

        if (existente is null)
            return NotFound(new { erro = "Usuário não encontrado." });

        await _service.AlterarSenhaAsync(id, dto);
        return NoContent();
    }

    [HttpPatch("{id:int}/ativo")]
    public async Task<IActionResult> DefinirAtivo([FromRoute] int id, [FromBody] DefinirAtivoRequestDto dto)
    {
        var existente = await _service.BuscarPorIdAsync(id);

        if (existente is null)
            return NotFound(new { erro = "Usuário não encontrado." });

        await _service.DefinirAtivoAsync(id, dto.Ativo);
        return NoContent();
    }
}
