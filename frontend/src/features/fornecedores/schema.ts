import { z } from 'zod'

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional()

const optionalUf = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => value === '' || value.length === 2, {
    message: 'UF deve ter 2 caracteres.',
  })
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional()

const optionalCep = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{8}$/.test(value), {
    message: 'CEP deve conter 8 dígitos numéricos.',
  })
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional()

export const fornecedorListFilterSchema = z.object({
  busca: z.string().optional().default(''),
  ativo: z.enum(['todos', 'ativos', 'inativos']).default('todos'),
  pagina: z.coerce.number().int().min(1).default(1),
  tamanhoPagina: z.coerce.number().int().min(1).default(10),
})

export const fornecedorCreateSchema = z.object({
  razaoSocial: z.string().trim().min(1, 'Razão social é obrigatória.'),
  cnpj: z
    .string()
    .trim()
    .refine((value) => /^\d{14}$/.test(value), {
      message: 'CNPJ deve conter 14 dígitos numéricos.',
    }),
  telefone: optionalText,
  email: z
    .string()
    .trim()
    .email('E-mail inválido.')
    .or(z.literal(''))
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .optional(),
  logradouro: optionalText,
  numero: optionalText,
  complemento: optionalText,
  bairro: optionalText,
  cidade: optionalText,
  uf: optionalUf,
  cep: optionalCep,
})

export const fornecedorUpdateSchema = fornecedorCreateSchema.omit({
  cnpj: true,
})

export type FornecedorListFilterFormData = z.infer<typeof fornecedorListFilterSchema>
export type FornecedorCreateFormData = z.infer<typeof fornecedorCreateSchema>
export type FornecedorUpdateFormData = z.infer<typeof fornecedorUpdateSchema>