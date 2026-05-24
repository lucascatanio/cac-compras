import { z } from 'zod'

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional()

export const setorFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório.')
    .max(100, 'Nome deve ter no máximo 100 caracteres.'),
  descricao: optionalText,
})

export type SetorFormData = z.infer<typeof setorFormSchema>
