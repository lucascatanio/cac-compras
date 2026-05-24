using Cac.Application.DTOs;
using Cac.Application.Interfaces;

namespace Cac.Application.Services;

public sealed class RelatorioService
{
    private readonly IRelatorioRepository _repository;

    public RelatorioService(IRelatorioRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<ConsumoPorSetorItemDto>> ConsumoPorSetorAsync(ConsumoPorSetorQueryDto query)
        => _repository.ConsumoPorSetorAsync(query);

    public Task<IEnumerable<FichaProdutoItemDto>> FichaProdutoAsync(int idProduto, FichaProdutoQueryDto query)
        => _repository.FichaProdutoAsync(idProduto, query);

    public Task<IEnumerable<FornecedoresPorProdutoItemDto>> FornecedoresPorProdutoAsync(FornecedoresPorProdutoQueryDto query)
        => _repository.FornecedoresPorProdutoAsync(query);

    public Task<IEnumerable<ProdutosEmFaltaItemDto>> ProdutosEmFaltaAsync(ProdutosEmFaltaQueryDto query)
        => _repository.ProdutosEmFaltaAsync(query);

    public Task<IEnumerable<MenorPrecoPorProdutoItemDto>> MenorPrecoPorProdutoAsync(MenorPrecoPorProdutoQueryDto query)
        => _repository.MenorPrecoPorProdutoAsync(query);
}
