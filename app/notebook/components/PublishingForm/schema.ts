import { z } from 'zod';
import { NonprofitOrg } from '@/types/nonprofit';

const optionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const publishingFormSchema = z
  .object({
    workId: z.string().optional(),
    articleType: z.enum(['discussion', 'preregistration', 'grant'] as const, {
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
    coverImage: z
      .object({
        file: z.instanceof(File).nullable().optional(),
        url: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    isJournalEnabled: z.boolean().optional(),
    selectedNonprofit: z.any().nullable().optional(),
    departmentLabName: z.string().optional(),
    shortDescription: z.string().optional(),
    organization: z.string().optional(),
    fundingAmount: z.string().optional(),
    applicationDeadline: z.date().nullable().optional(),
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

      // Validate cover image
      if (!data.coverImage?.file && !data.coverImage?.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cover image is required for preregistration',
          path: ['coverImage'],
        });
      }
    }

    // Grant-specific validations
    if (data.articleType === 'grant') {
      // Validate short description
      if (!data.shortDescription || data.shortDescription.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Short description is required for grants',
          path: ['shortDescription'],
        });
      }

      // Validate organization
      if (!data.organization || data.organization.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Organization is required for grants',
          path: ['organization'],
        });
      }

      // Validate funding amount
      const num = parseFloat(data.fundingAmount?.replace(/[^0-9.]/g, '') || '0');
      if (num <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Funding amount must be greater than 0',
          path: ['fundingAmount'],
        });
      }

      // Validate cover image for grant
      if (!data.coverImage?.file && !data.coverImage?.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cover image is required for grants',
          path: ['coverImage'],
        });
      }

      // Validate application deadline for grants
      if (!data.applicationDeadline) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Application deadline is required for grants',
          path: ['applicationDeadline'],
        });
      } else if (data.applicationDeadline <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Application deadline must be in the future',
          path: ['applicationDeadline'],
        });
      }
    }
  });

export type PublishingFormData = z.infer<typeof publishingFormSchema>;
export type SelectOption = z.infer<typeof optionSchema>;
