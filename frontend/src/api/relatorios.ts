import { api } from '@/api/client'
import type {
  ComparativoPrecosItem,
  ComparativoPrecosParams,
  ConsumoPorSetorItem,
  ConsumoPorSetorParams,
  CurvaAbcItem,
  CurvaAbcParams,
  FichaProdutoItem,
  FichaProdutoParams,
  FornecedoresPorProdutoItem,
  FornecedoresPorProdutoParams,
  HistoricoPrecosItem,
  HistoricoPrecosParams,
  MenorPrecoPorProdutoItem,
  MenorPrecoPorProdutoParams,
  ProdutosEmFaltaItem,
  ProdutosEmFaltaParams,
  ProdutosMaisDemandadosItem,
  ProdutosMaisDemandadosParams,
} from '@/types/api'

export const relatoriosApi = {
  async consumoPorSetor(params: ConsumoPorSetorParams) {
    const response = await api.get<ConsumoPorSetorItem[]>('/relatorios/consumo-por-setor', { params })
    return response.data
  },

  async fichaProduto(idProduto: number, params: FichaProdutoParams) {
    const response = await api.get<FichaProdutoItem[]>(`/relatorios/ficha-produto/${idProduto}`, { params })
    return response.data
  },

  async fornecedoresPorProduto(params: FornecedoresPorProdutoParams) {
    const response = await api.get<FornecedoresPorProdutoItem[]>('/relatorios/fornecedores-por-produto', { params })
    return response.data
  },

  async produtosEmFalta(params: ProdutosEmFaltaParams) {
    const response = await api.get<ProdutosEmFaltaItem[]>('/relatorios/produtos-em-falta', { params })
    return response.data
  },

  async menorPrecoPorProduto(params: MenorPrecoPorProdutoParams) {
    const response = await api.get<MenorPrecoPorProdutoItem[]>('/relatorios/menor-preco-por-produto', { params })
    return response.data
  },

  async produtosMaisDemandados(params: ProdutosMaisDemandadosParams) {
    const response = await api.get<ProdutosMaisDemandadosItem[]>('/relatorios/produtos-mais-demandados', { params })
    return response.data
  },

  async comparativoPrecos(params: ComparativoPrecosParams) {
    const response = await api.get<ComparativoPrecosItem[]>('/relatorios/comparativo-precos', { params })
    return response.data
  },

  async curvaAbc(params: CurvaAbcParams) {
    const response = await api.get<CurvaAbcItem[]>('/relatorios/curva-abc', { params })
    return response.data
  },

  async historicoPrecos(idProduto: number, params: HistoricoPrecosParams) {
    const response = await api.get<HistoricoPrecosItem[]>(`/relatorios/historico-precos/${idProduto}`, { params })
    return response.data
  },
}
