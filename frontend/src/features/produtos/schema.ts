import { z } from 'zod'

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional()

export const produtoFormSchema = z.object({
  idGrupo: z.string().refine((v) => v !== '' && v !== '0', {
    message: 'Grupo é obrigatório.',
  }),
  nome: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório.')
    .max(150, 'Nome deve ter no máximo 150 caracteres.'),
  descricao: optionalText,
  unidadeMedida: z
    .string()
    .trim()
    .min(1, 'Unidade de medida é obrigatória.')
    .max(20, 'Unidade de medida deve ter no máximo 20 caracteres.'),
  estoqueMinimo: z.string().refine(
    (v) => {
      const n = Number(v)
      return !isNaN(n) && n >= 0
    },
    { message: 'Estoque mínimo não pode ser negativo.' }
  ),
})

export type ProdutoFormData = z.infer<typeof produtoFormSchema>
