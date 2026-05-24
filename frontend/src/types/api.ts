export interface UsuarioLogado {
  id: number
  nomeCompleto: string
  username: string
  perfilCodigo: string
  perfilNome: string
}

export interface LoginResponse {
  token: string
  usuario: UsuarioLogado
}

export interface RespostaPaginada<T> {
  itens: T[]
  total: number
  pagina: number
  tamanhoPagina: number
}

export interface RespostaErro {
  erro: string
}

export interface FornecedorListItem {
  idFornecedor: number
  razaoSocial: string
  cnpj: string
  telefone: string | null
  email: string | null
  cidade: string | null
  uf: string | null
  ativo: boolean
}

export interface FornecedorDetail {
  idFornecedor: number
  razaoSocial: string
  cnpj: string
  telefone: string | null
  email: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  cep: string | null
  ativo: boolean
}

export interface FornecedorListParams {
  ativo?: boolean
  busca?: string
  pagina: number
  tamanhoPagina: number
}

export interface FornecedorCreateRequest {
  razaoSocial: string
  cnpj: string
  telefone?: string | null
  email?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
  cep?: string | null
}

export interface FornecedorUpdateRequest {
  razaoSocial: string
  telefone?: string | null
  email?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
  cep?: string | null
}

export interface DefinirAtivoRequest {
  ativo: boolean
}

export interface CreatedIdResponse {
  id: number
}

export interface GrupoListItem {
  idGrupo: number
  nome: string
  descricao: string | null
  qtdProdutosAtivos: number
}

export interface GrupoDetail {
  idGrupo: number
  nome: string
  descricao: string | null
}

export interface GrupoListParams {
  busca?: string
}

export interface GrupoCreateRequest {
  nome: string
  descricao?: string | null
}

export interface GrupoUpdateRequest {
  nome: string
  descricao?: string | null
}

export type StatusEstoque = 'EM_FALTA' | 'BAIXO' | 'OK'

export interface ProdutoListItem {
  idProduto: number
  nome: string
  descricao: string | null
  unidadeMedida: string
  saldo: number
  estoqueMinimo: number
  precoMedio: number
  ativo: boolean
  idGrupo: number
  grupoNome: string
  statusEstoque: StatusEstoque
}

export interface ProdutoDetail {
  idProduto: number
  idGrupo: number
  grupoNome: string
  nome: string
  descricao: string | null
  unidadeMedida: string
  estoqueMinimo: number
  saldo: number
  precoMedio: number
  ativo: boolean
}

export interface ProdutoListParams {
  ativo?: boolean
  idGrupo?: number
  apenasEmFalta?: boolean
  busca?: string
  pagina: number
  tamanhoPagina: number
}

export interface ProdutoCreateRequest {
  idGrupo: number
  nome: string
  descricao?: string | null
  unidadeMedida: string
  estoqueMinimo?: number
}

export interface ProdutoUpdateRequest {
  idGrupo: number
  nome: string
  descricao?: string | null
  unidadeMedida: string
  estoqueMinimo?: number
}

export interface SetorListItem {
  idSetor: number
  nome: string
  descricao: string | null
  ativo: boolean
}

export interface SetorDetail {
  idSetor: number
  nome: string
  descricao: string | null
  ativo: boolean
}

export interface SetorListParams {
  ativo?: boolean
  busca?: string
}

export interface SetorCreateRequest {
  nome: string
  descricao?: string | null
}

export interface SetorUpdateRequest {
  nome: string
  descricao?: string | null
}

export interface PerfilListItem {
  idPerfil: number
  codigo: string
  nome: string
  descricao: string | null
}

export interface UsuarioListItem {
  idUsuario: number
  username: string
  nomeCompleto: string
  email: string | null
  ativo: boolean
  dataCriacao: string
  ultimoLogin: string | null
  perfilCodigo: string
  perfilNome: string
}

export interface UsuarioDetail {
  idUsuario: number
  username: string
  nomeCompleto: string
  email: string | null
  ativo: boolean
  dataCriacao: string
  ultimoLogin: string | null
  idPerfil: number
  perfilCodigo: string
  perfilNome: string
}

export interface UsuarioListParams {
  ativo?: boolean
  codigoPerfil?: string
  busca?: string
  pagina: number
  tamanhoPagina: number
}

export interface UsuarioCreateRequest {
  username: string
  senha: string
  nomeCompleto: string
  email?: string | null
  codigoPerfil: string
}

export interface UsuarioUpdateRequest {
  nomeCompleto: string
  email?: string | null
  codigoPerfil: string
}

export interface UsuarioChangePasswordRequest {
  novaSenha: string
}

export interface EntradaListItem {
  idEntrada: number
  dataEntrada: string
  numeroNotaFiscal: string | null
  observacao: string | null
  idFornecedor: number
  fornecedor: string
  qtdItens: number
  valorTotal: number | null
}

export interface EntradaItem {
  idItemEntrada: number
  idProduto: number
  produto: string
  unidadeMedida: string
  quantidade: number
  precoUnitario: number
  valorTotal: number
}

export interface EntradaDetail {
  idEntrada: number
  dataEntrada: string
  numeroNotaFiscal: string | null
  observacao: string | null
  idFornecedor: number
  fornecedor: string
  cnpj: string
  itens: EntradaItem[]
}

export interface EntradaListParams {
  dataInicio?: string
  dataFim?: string
  idFornecedor?: number
  pagina: number
  tamanhoPagina: number
}

export interface ItemEntradaRequest {
  idProduto: number
  quantidade: number
  precoUnitario: number
}

export interface RegistrarEntradaRequest {
  idFornecedor: number
  numeroNotaFiscal?: string | null
  observacao?: string | null
  itens: ItemEntradaRequest[]
}

export interface SaidaListItem {
  idSaida: number
  dataSaida: string
  observacao: string | null
  idSetor: number
  setor: string
  qtdItens: number
  valorTotal: number | null
}

export interface SaidaItem {
  idItemSaida: number
  idProduto: number
  produto: string
  unidadeMedida: string
  quantidade: number
  precoMedioUnitario: number
  valorTotal: number
}

export interface SaidaDetail {
  idSaida: number
  dataSaida: string
  observacao: string | null
  idSetor: number
  setor: string
  itens: SaidaItem[]
}

export interface SaidaListParams {
  dataInicio?: string
  dataFim?: string
  idSetor?: number
  pagina: number
  tamanhoPagina: number
}

export interface ItemSaidaRequest {
  idProduto: number
  quantidade: number
}

export interface RegistrarSaidaRequest {
  idSetor: number
  observacao?: string | null
  itens: ItemSaidaRequest[]
}