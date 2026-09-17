import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    avatarUrl: z.string().trim().url().max(500).nullable().optional(),
  })
  .refine((data) => data.name !== undefined || data.avatarUrl !== undefined, {
    message: 'At least one profile field is required',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
