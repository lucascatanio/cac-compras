import { z } from 'zod'

const optionalEmail = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional()
  .refine((v) => v == null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'E-mail inválido.',
  })

export const usuarioCriarSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Username é obrigatório.')
    .max(50, 'Username deve ter no máximo 50 caracteres.'),
  senha: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres.')
    .max(100, 'Senha deve ter no máximo 100 caracteres.'),
  nomeCompleto: z
    .string()
    .trim()
    .min(1, 'Nome completo é obrigatório.')
    .max(150, 'Nome deve ter no máximo 150 caracteres.'),
  email: optionalEmail,
  codigoPerfil: z.string().min(1, 'Perfil é obrigatório.'),
})

export const usuarioEditarSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(1, 'Nome completo é obrigatório.')
    .max(150, 'Nome deve ter no máximo 150 caracteres.'),
  email: optionalEmail,
  codigoPerfil: z.string().min(1, 'Perfil é obrigatório.'),
})

export const usuarioAlterarSenhaSchema = z
  .object({
    novaSenha: z
      .string()
      .min(6, 'Nova senha deve ter no mínimo 6 caracteres.')
      .max(100, 'Nova senha deve ter no máximo 100 caracteres.'),
    confirmarSenha: z.string().min(1, 'Confirmação de senha é obrigatória.'),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'],
  })

export type UsuarioCriarFormData = z.infer<typeof usuarioCriarSchema>
export type UsuarioEditarFormData = z.infer<typeof usuarioEditarSchema>
export type UsuarioAlterarSenhaFormData = z.infer<typeof usuarioAlterarSenhaSchema>
