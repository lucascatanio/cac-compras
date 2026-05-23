using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class AuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(
        IAuthRepository authRepository,
        IJwtService jwtService,
        IPasswordHasher passwordHasher)
    {
        _authRepository = authRepository;
        _jwtService     = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var usuario = await _authRepository.BuscarUsuarioPorUsernameAsync(request.Username);

        if (usuario is null)
            return null;

        if (!_passwordHasher.Verify(request.Senha, usuario.SenhaHash))
            return null;

        await _authRepository.RegistrarUltimoLoginAsync(usuario.IdUsuario);

        var token = _jwtService.GerarToken(usuario);

        var usuarioLogado = new UsuarioLogadoDto(
            Id:           usuario.IdUsuario,
            NomeCompleto: usuario.NomeCompleto,
            Username:     usuario.Username,
            PerfilCodigo: usuario.PerfilCodigo,
            PerfilNome:   usuario.PerfilNome
        );

        return new LoginResponse(token, usuarioLogado);
    }
}