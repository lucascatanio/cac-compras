using Cac.Application.DTOs;

namespace Cac.Application.Interfaces;

public interface IRelatorioRepository
{
    Task<IEnumerable<ConsumoPorSetorItemDto>> ConsumoPorSetorAsync(ConsumoPorSetorQueryDto query);
    Task<IEnumerable<FichaProdutoItemDto>> FichaProdutoAsync(int idProduto, FichaProdutoQueryDto query);
    Task<IEnumerable<FornecedoresPorProdutoItemDto>> FornecedoresPorProdutoAsync(FornecedoresPorProdutoQueryDto query);
    Task<IEnumerable<ProdutosEmFaltaItemDto>> ProdutosEmFaltaAsync(ProdutosEmFaltaQueryDto query);
    Task<IEnumerable<MenorPrecoPorProdutoItemDto>> MenorPrecoPorProdutoAsync(MenorPrecoPorProdutoQueryDto query);
}
