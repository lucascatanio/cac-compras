import { api } from '@/api/client'
import type {
  ConsumoPorSetorItem,
  ConsumoPorSetorParams,
  FichaProdutoItem,
  FichaProdutoParams,
  FornecedoresPorProdutoItem,
  FornecedoresPorProdutoParams,
  MenorPrecoPorProdutoItem,
  MenorPrecoPorProdutoParams,
  ProdutosEmFaltaItem,
  ProdutosEmFaltaParams,
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
}
