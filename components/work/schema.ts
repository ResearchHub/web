import { z } from 'zod';

export const workEditSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(300, 'Title must be less than 300 characters'),
  doi: z.string().optional(),
  publishedDate: z.string().optional(),
  topics: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .optional(),
  license: z.string().optional(),
  abstract: z.string().optional(),
});

export type WorkEditFormData = z.infer<typeof workEditSchema>;
