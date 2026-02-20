import { z } from 'zod';

const optionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

const addIssue = (ctx: z.RefinementCtx, path: string, message: string) => {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [path] });
};

const parseBudget = (budget?: string): number =>
  Number.parseFloat(budget?.replaceAll(/[^0-9.]/g, '') || '0');

const validatePreregistration = (data: any, ctx: z.RefinementCtx) => {
  if (parseBudget(data.budget) <= 0) {
    addIssue(ctx, 'budget', 'Funding goal must be greater than 0');
  }
  if (!data.coverImage?.file && !data.coverImage?.url) {
    addIssue(ctx, 'coverImage', 'Cover image is required for proposal');
  }
};

const validateGrant = (data: any, ctx: z.RefinementCtx) => {
  if (!data.shortDescription || data.shortDescription.trim().length === 0) {
    addIssue(ctx, 'shortDescription', 'Short description is required for grants');
  }
  if (data.organization && data.organization.trim().length > 200) {
    addIssue(ctx, 'organization', 'Organization name must be 200 characters or less');
  }
  if (parseBudget(data.budget) <= 0) {
    addIssue(ctx, 'budget', 'Funding amount must be greater than 0');
  }
  if (!data.applicationDeadline) {
    addIssue(ctx, 'applicationDeadline', 'Application deadline is required for grants');
  } else if (data.applicationDeadline <= new Date()) {
    addIssue(ctx, 'applicationDeadline', 'Application deadline must be in the future');
  }
};

export const publishingFormSchema = z
  .object({
    workId: z.string().optional(),
    articleType: z.enum(['discussion', 'preregistration', 'grant'] as const, {
      required_error: 'Please select a work type',
      invalid_type_error: 'Please select a valid work type',
    }),
    authors: z.array(optionSchema),
    contacts: z.array(optionSchema),
    topics: z.array(optionSchema),
    budget: z.string().optional(),
    rewardFunders: z.boolean(),
    nftArt: z.any().nullable(),
    nftSupply: z
      .string()
      .refine((val) => Number.parseInt(val.replaceAll(/\D/g, '') || '0') >= 100, {
        message: 'NFT supply must be at least 100',
      }),
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
    applicationDeadline: z.date().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.topics.length === 0) {
      addIssue(ctx, 'topics', 'At least one topic is required');
    }

    if (data.articleType === 'grant') {
      if (data.contacts.length === 0) {
        addIssue(ctx, 'contacts', 'At least one contact is required for grants');
      }
    } else if (data.authors.length === 0) {
      addIssue(ctx, 'authors', 'At least one author is required');
    }

    if (data.articleType === 'preregistration') {
      validatePreregistration(data, ctx);
    }
    if (data.articleType === 'grant') {
      validateGrant(data, ctx);
    }
  });

export type PublishingFormData = z.infer<typeof publishingFormSchema>;
export type SelectOption = z.infer<typeof optionSchema>;
