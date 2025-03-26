import { z } from 'zod';

const optionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const publishingFormSchema = z
  .object({
    workId: z.string().optional(),
    articleType: z.enum(['discussion', 'preregistration'] as const, {
      required_error: 'Please select a work type',
      invalid_type_error: 'Please select a valid work type',
    }),
    authors: z.array(optionSchema),
    topics: z.array(optionSchema),
    budget: z.string().optional(),
    rewardFunders: z.boolean(),
    nftArt: z.any().nullable(),
    nftSupply: z.string().refine(
      (val) => {
        const num = parseInt(val.replace(/[^0-9]/g, '') || '0');
        return num >= 100;
      },
      { message: 'NFT supply must be at least 100' }
    ),
    isJournalEnabled: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate topics
    if (data.topics.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one topic is required',
        path: ['topics'],
      });
    }

    // Validate authors
    if (data.authors.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one author is required',
        path: ['authors'],
      });
    }

    // Preregistration-specific validations
    if (data.articleType === 'preregistration') {
      // Validate budget
      const num = parseFloat(data.budget?.replace(/[^0-9.]/g, '') || '0');
      if (num <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Funding goal must be greater than 0',
          path: ['budget'],
        });
      }
    }
  });

export type PublishingFormData = z.infer<typeof publishingFormSchema>;
export type SelectOption = z.infer<typeof optionSchema>;
