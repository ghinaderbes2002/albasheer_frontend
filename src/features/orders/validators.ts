import { z } from 'zod'

export const checkoutSchema = z.object({
  city: z.string().min(1, 'city.required'),
  delivery_address: z
    .string()
    .min(5, 'address.tooShort')
    .max(500),
  customer_note: z.string().max(500).optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
