import { z } from 'zod';

// Schema for metadata tab
export const workMetadataSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(300, 'Title must be less than 300 characters'),
  doi: z.string().min(1, 'DOI is required'),
  publishedDate: z.string().min(1, 'Published date is required'),
  topics: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .min(1, 'At least one topic is required'),
  license: z.string().min(1, 'License is required'),
});

// Schema for abstract tab
export const workAbstractSchema = z.object({
  abstractPlainText: z.string().min(1, 'Abstract is required'),
  // abstractHtml: z.string().min(1, 'Abstract is required'),
});

// Combined schema for the entire form
export const workEditSchema = z.object({
  ...workMetadataSchema.shape,
  ...workAbstractSchema.shape,
});

export type WorkMetadataFormData = z.infer<typeof workMetadataSchema>;
export type WorkAbstractFormData = z.infer<typeof workAbstractSchema>;
export type WorkEditFormData = z.infer<typeof workEditSchema>;
