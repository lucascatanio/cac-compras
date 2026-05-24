import { useQuery } from '@tanstack/react-query'
import { relatoriosApi } from '@/api/relatorios'
import type {
  ConsumoPorSetorParams,
  FichaProdutoParams,
  FornecedoresPorProdutoParams,
  MenorPrecoPorProdutoParams,
  ProdutosEmFaltaParams,
} from '@/types/api'

export function useConsumoPorSetor(params: ConsumoPorSetorParams, enabled: boolean) {
  return useQuery({
    queryKey: ['relatorios', 'consumo-por-setor', params],
    queryFn: () => relatoriosApi.consumoPorSetor(params),
    enabled,
  })
}

export function useFichaProduto(
  idProduto: number | undefined,
  params: FichaProdutoParams,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['relatorios', 'ficha-produto', idProduto, params],
    queryFn: () => relatoriosApi.fichaProduto(idProduto as number, params),
    enabled: enabled && Boolean(idProduto),
  })
}

export function useFornecedoresPorProduto(params: FornecedoresPorProdutoParams, enabled: boolean) {
  return useQuery({
    queryKey: ['relatorios', 'fornecedores-por-produto', params],
    queryFn: () => relatoriosApi.fornecedoresPorProduto(params),
    enabled,
  })
}

export function useProdutosEmFalta(params: ProdutosEmFaltaParams, enabled: boolean) {
  return useQuery({
    queryKey: ['relatorios', 'produtos-em-falta', params],
    queryFn: () => relatoriosApi.produtosEmFalta(params),
    enabled,
  })
}

export function useMenorPrecoPorProduto(params: MenorPrecoPorProdutoParams, enabled: boolean) {
  return useQuery({
    queryKey: ['relatorios', 'menor-preco-por-produto', params],
    queryFn: () => relatoriosApi.menorPrecoPorProduto(params),
    enabled,
  })
}
