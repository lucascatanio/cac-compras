using Cac.Application.Interfaces;
using Cac.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Cac.Infrastructure.Auth;

public sealed class JwtService : IJwtService
{
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expirationMinutes;

    public JwtService(IConfiguration configuration)
    {
        var jwt = configuration.GetSection("Jwt");

        _secretKey         = jwt["SecretKey"]        ?? throw new InvalidOperationException("Jwt:SecretKey não configurado.");
        _issuer            = jwt["Issuer"]           ?? throw new InvalidOperationException("Jwt:Issuer não configurado.");
        _audience          = jwt["Audience"]         ?? throw new InvalidOperationException("Jwt:Audience não configurado.");
        _expirationMinutes = int.TryParse(jwt["ExpirationMinutes"], out var exp) ? exp : 480;
    }

    // Claims carregadas no token:
    //   sub          -> id do usuário (lido via ClaimTypes.NameIdentifier)
    //   unique_name  -> username      (lido via ClaimTypes.Name)
    //   nome         -> nome completo (claim customizada)
    //   perfil_nome  -> nome do perfil (claim customizada)
    //   role         -> código do perfil, ex: COMPRADOR (usado por [Authorize(Roles)])
    public string GerarToken(Usuario usuario)
    {
        Claim[] claims =
        [
            new Claim(JwtRegisteredClaimNames.Sub,        usuario.IdUsuario.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, usuario.Username),
            new Claim("nome",        usuario.NomeCompleto),
            new Claim("perfil_nome", usuario.PerfilNome),
            new Claim("role",        usuario.PerfilCodigo)
        ];

        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer:             _issuer,
            audience:           _audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddMinutes(_expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}