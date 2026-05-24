import { z } from 'zod'

const itemEntradaSchema = z.object({
  idProduto: z
    .string()
    .refine((v) => Number(v) > 0, { message: 'Selecione um produto.' }),
  quantidade: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: 'Quantidade deve ser maior que zero.',
    }),
  precoUnitario: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: 'Preço unitário deve ser maior que zero.',
    }),
})

export const entradaFormSchema = z.object({
  idFornecedor: z
    .string()
    .refine((v) => Number(v) > 0, { message: 'Selecione um fornecedor.' }),
  numeroNotaFiscal: z.string().trim().optional(),
  observacao: z.string().trim().optional(),
  itens: z
    .array(itemEntradaSchema)
    .min(1, { message: 'Adicione pelo menos um item.' }),
})

export type EntradaFormData = z.infer<typeof entradaFormSchema>
