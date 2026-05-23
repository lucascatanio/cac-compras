namespace Cac.Application.DTOs;

public sealed record LoginRequest(string Username, string Senha);

public sealed record LoginResponse(string Token, UsuarioLogadoDto Usuario);

public sealed record UsuarioLogadoDto(
    int Id,
    string NomeCompleto,
    string Username,
    string PerfilCodigo,
    string PerfilNome
);