using Cac.Application.DTOs;

namespace Cac.Application.Interfaces;

public interface IRelatorioRepository
{
    Task<IEnumerable<ConsumoPorSetorItemDto>> ConsumoPorSetorAsync(ConsumoPorSetorQueryDto query);
    Task<IEnumerable<FichaProdutoItemDto>> FichaProdutoAsync(int idProduto, FichaProdutoQueryDto query);
    Task<IEnumerable<FornecedoresPorProdutoItemDto>> FornecedoresPorProdutoAsync(FornecedoresPorProdutoQueryDto query);
    Task<IEnumerable<ProdutosEmFaltaItemDto>> ProdutosEmFaltaAsync(ProdutosEmFaltaQueryDto query);
    Task<IEnumerable<MenorPrecoPorProdutoItemDto>> MenorPrecoPorProdutoAsync(MenorPrecoPorProdutoQueryDto query);
    Task<IEnumerable<ProdutosMaisDemandadosItemDto>> ProdutosMaisDemandadosAsync(ProdutosMaisDemandadosQueryDto query);
    Task<IEnumerable<ComparativoPrecosItemDto>> ComparativoPrecosAsync(ComparativoPrecosQueryDto query);
    Task<IEnumerable<CurvaAbcItemDto>> CurvaAbcAsync(CurvaAbcQueryDto query);
    Task<IEnumerable<HistoricoPrecosItemDto>> HistoricoPrecosAsync(int idProduto, HistoricoPrecosQueryDto query);
}
