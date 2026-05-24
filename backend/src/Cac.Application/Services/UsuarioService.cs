using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class UsuarioService
{
    private readonly IUsuarioRepository _repository;
    private readonly IPasswordHasher _passwordHasher;

    public UsuarioService(IUsuarioRepository repository, IPasswordHasher passwordHasher)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
    }

    public Task<PagedResultDto<UsuarioListItemDto>> ListarAsync(UsuarioListQueryDto query)
        => _repository.ListarAsync(query);

    public Task<UsuarioDetailDto?> BuscarPorIdAsync(int id)
        => _repository.BuscarPorIdAsync(id);

    public async Task<int> CadastrarAsync(UsuarioCreateDto dto)
    {
        var senhaHash = _passwordHasher.Hash(dto.Senha);

        return await _repository.CadastrarAsync(
            dto.Username.Trim(),
            senhaHash,
            dto.NomeCompleto.Trim(),
            string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim(),
            dto.CodigoPerfil.Trim()
        );
    }

    public Task EditarAsync(int id, UsuarioUpdateDto dto)
        => _repository.EditarAsync(
            id,
            dto.NomeCompleto.Trim(),
            string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim(),
            dto.CodigoPerfil.Trim()
        );

    public async Task AlterarSenhaAsync(int id, AlterarSenhaDto dto)
    {
        var novoSenhaHash = _passwordHasher.Hash(dto.NovaSenha);
        await _repository.AlterarSenhaAsync(id, novoSenhaHash);
    }

    public Task DefinirAtivoAsync(int id, bool ativo)
        => _repository.DefinirAtivoAsync(id, ativo);
}
