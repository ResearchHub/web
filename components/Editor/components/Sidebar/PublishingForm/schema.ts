import { z } from 'zod';
import { NonprofitOrg } from '@/types/nonprofit';

const topicOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// Schema for nonprofit organization to be used in the form
const nonprofitOrgSchema = z.object({
  id: z.string(),
  name: z.string(),
  ein: z.string(),
  deployments: z.array(
    z.object({
      isDeployed: z.boolean(),
      chainId: z.number(),
      address: z.string(),
    })
  ),
  logoUrl: z.string().optional(),
  nteeCode: z.string(),
  nteeDescription: z.string(),
  description: z.string(),
  address: z.object({
    region: z.string(),
    country: z.string(),
  }),
  endaomentUrl: z.string(),
  contibutionCount: z.number(),
  contibutionTotal: z.string(),
});

export const publishingFormSchema = z
  .object({
    workId: z.string().optional(),
    articleType: z.enum(['discussion', 'preregistration', 'question'] as const, {
      required_error: 'Please select a work type',
      invalid_type_error: 'Please select a valid work type',
    }),
    authors: z.array(z.string()),
    topics: z.array(topicOptionSchema),
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
    selectedNonprofit: nonprofitOrgSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
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

      // Validate topics
      if (data.topics.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one topic is required',
          path: ['topics'],
        });
      }
    }
  });

export type PublishingFormData = z.infer<typeof publishingFormSchema>;
export type TopicOption = z.infer<typeof topicOptionSchema>;
