import { z } from 'zod'

export const checkoutSchema = z.object({
  branch_id: z
    .number({ error: 'branch.required' })
    .int()
    .positive('branch.required'),
  delivery_address: z
    .string()
    .min(5, 'address.tooShort')
    .max(500),
  deposit_amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'deposit.invalid')
    .refine((v) => parseFloat(v) >= 0, 'deposit.invalid'),
  customer_note: z.string().max(500).optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
