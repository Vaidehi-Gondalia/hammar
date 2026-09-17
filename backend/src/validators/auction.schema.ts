import { z } from 'zod';

export const createAuctionSchema = z
  .object({
    title: z.string().trim().min(3).max(200),

    description: z.string().trim().min(10).max(5000),

    category: z.string().trim().min(2).max(100),

    startingPrice: z.number().int().positive(),

    reservePrice: z.number().int().positive().optional(),

    startTime: z.coerce.date(),

    endTime: z.coerce.date(),
  })
  .refine(
    (data) => !data.reservePrice || data.reservePrice >= data.startingPrice,
    {
      message: 'Reserve price must be greater than or equal to starting price',
      path: ['reservePrice'],
    },
  )
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export const updateAuctionSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),

    description: z.string().trim().min(10).max(5000).optional(),

    category: z.string().trim().min(2).max(100).optional(),

    startingPrice: z.number().int().positive().optional(),

    reservePrice: z.number().int().positive().nullable().optional(),

    startTime: z.coerce.date().optional(),

    endTime: z.coerce.date().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided',
  });

export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>;
export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
