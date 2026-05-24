import { useQuery } from '@tanstack/react-query'
import { relatoriosApi } from '@/api/relatorios'
import type {
  ComparativoPrecosParams,
  ConsumoPorSetorParams,
  CurvaAbcParams,
  FichaProdutoParams,
  FornecedoresPorProdutoParams,
  HistoricoPrecosParams,
  MenorPrecoPorProdutoParams,
  ProdutosEmFaltaParams,
  ProdutosMaisDemandadosParams,
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

export function useProdutosMaisDemandados(params: ProdutosMaisDemandadosParams, enabled: boolean) {
  return useQuery({
    queryKey: ['relatorios', 'produtos-mais-demandados', params],
    queryFn: () => relatoriosApi.produtosMaisDemandados(params),
    enabled,
  })
}

export function useComparativoPrecos(params: ComparativoPrecosParams, enabled: boolean) {
  return useQuery({
    queryKey: ['relatorios', 'comparativo-precos', params],
    queryFn: () => relatoriosApi.comparativoPrecos(params),
    enabled,
  })
}

export function useCurvaAbc(params: CurvaAbcParams, enabled: boolean) {
  return useQuery({
    queryKey: ['relatorios', 'curva-abc', params],
    queryFn: () => relatoriosApi.curvaAbc(params),
    enabled,
  })
}

export function useHistoricoPrecos(
  idProduto: number | undefined,
  params: HistoricoPrecosParams,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['relatorios', 'historico-precos', idProduto, params],
    queryFn: () => relatoriosApi.historicoPrecos(idProduto as number, params),
    enabled: enabled && Boolean(idProduto),
  })
}
