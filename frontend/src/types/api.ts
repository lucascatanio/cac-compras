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
