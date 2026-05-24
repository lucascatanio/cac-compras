using Cac.Application.DTOs;
using Cac.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Cac.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        if (response is null)
            return Unauthorized(new { erro = "Usuario ou senha invalidos." });

        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        // DefaultInboundClaimTypeMap limpo em Program.cs:
        // claims chegam com os nomes originais do JWT.
        var idRaw = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var username = User.FindFirstValue(JwtRegisteredClaimNames.UniqueName) ?? string.Empty;
        var nomeCompleto = User.FindFirstValue("nome") ?? string.Empty;
        var perfilNome = User.FindFirstValue("perfil_nome") ?? string.Empty;
        var perfilCodigo = User.FindFirstValue("role") ?? string.Empty;

        if (!int.TryParse(idRaw, out var id))
            return Unauthorized(new { erro = "Token invalido." });

        return Ok(new UsuarioLogadoDto(
            Id: id,
            NomeCompleto: nomeCompleto,
            Username: username,
            PerfilCodigo: perfilCodigo,
            PerfilNome: perfilNome
        ));
    }
}