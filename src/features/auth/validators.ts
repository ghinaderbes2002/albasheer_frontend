import { z } from 'zod'

const phoneRegex = /^[+0-9\s-]{9,20}$/

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(9, 'phone.tooShort')
    .max(20, 'phone.tooLong')
    .regex(phoneRegex, 'phone.invalid')
    .transform((v) => v.replace(/[\s-]/g, '')),
})

export type PhoneFormValues = z.infer<typeof phoneSchema>

export const otpSchema = z.object({
  code: z.string().regex(/^\d{5}$/, 'code.invalid'),
})

export type OtpFormValues = z.infer<typeof otpSchema>

export const profileSchema = z.object({
  first_name: z.string().min(1, 'required').max(50),
  last_name: z.string().min(1, 'required').max(50),
  address: z.string().min(5, 'address.tooShort').max(255),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

export const staffLoginSchema = z.object({
  phone: z
    .string()
    .min(9, 'phone.tooShort')
    .max(20, 'phone.tooLong')
    .regex(phoneRegex, 'phone.invalid')
    .transform((v) => v.replace(/[\s-]/g, '')),
  password: z.string().min(1, 'required'),
})

export type StaffLoginFormValues = z.infer<typeof staffLoginSchema>
