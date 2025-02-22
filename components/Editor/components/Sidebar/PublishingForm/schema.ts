import { z } from 'zod';

export const publishingFormSchema = z
  .object({
    workId: z.string().optional(),
    articleType: z.enum(['research', 'preregistration', 'other'] as const),
    authors: z.array(z.string()),
    topics: z.array(z.string()),
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
  .refine(
    (data) => {
      if (data.articleType === 'preregistration') {
        const num = parseFloat(data.budget?.replace(/[^0-9.]/g, '') || '0');
        return num > 0;
      }
      return true;
    },
    {
      message: 'Funding goal must be greater than 0 for preregistration',
      path: ['budget'],
    }
  );

export type PublishingFormData = z.infer<typeof publishingFormSchema>;
