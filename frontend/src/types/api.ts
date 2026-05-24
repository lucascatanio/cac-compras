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