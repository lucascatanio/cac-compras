import { z } from 'zod'

const itemSaidaSchema = z.object({
  idProduto: z
    .string()
    .refine((v) => Number(v) > 0, { message: 'Selecione um produto.' }),
  quantidade: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: 'Quantidade deve ser maior que zero.',
    }),
})

export const saidaFormSchema = z.object({
  idSetor: z
    .string()
    .refine((v) => Number(v) > 0, { message: 'Selecione um setor.' }),
  observacao: z.string().trim().optional(),
  itens: z
    .array(itemSaidaSchema)
    .min(1, { message: 'Adicione pelo menos um item.' }),
})

export type SaidaFormData = z.infer<typeof saidaFormSchema>
