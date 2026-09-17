import { z } from 'zod';

export const registerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),

  email: z.string().trim().email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),

  role: z.enum(['buyer', 'seller']),

  avatar: z
    .instanceof(File)
    .refine((file) => file.type.startsWith('image/'), {
      message: 'Please select an image file',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Avatar image must be smaller than 5 MB',
    })
    .optional(),
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),

  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
