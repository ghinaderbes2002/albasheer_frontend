import { z } from 'zod'

export const checkoutSchema = z.object({
  city: z.string().min(1, 'city.required'),
  address_id: z.number().min(1, 'address.required'),
  customer_note: z.string().max(500).optional(),
  payment_method_id: z.number().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
