import { z } from 'zod';
import { validateResearchHubUrl } from '@/utils/url';
import type { ExpertiseLevel, Region, Gender } from '@/types/expertFinder';

export const EXPERTISE_LEVELS_SPECIFIC: [ExpertiseLevel, ...ExpertiseLevel[]] = [
  'PhD/PostDocs',
  'Early Career Researchers',
  'Mid-Career Researchers',
  'Top Expert/World Renowned Expert',
];

const REGIONS: Region[] = [
  'All Regions',
  'US',
  'non-US',
  'Europe',
  'Asia-Pacific',
  'Africa & MENA',
];

const GENDERS: Gender[] = ['All Genders', 'Male', 'Female'];

const MIN_EXPERTS = 5;
const MAX_EXPERTS = 20;

/** ResearchHub URL validated with the same rules as parseResearchHubUrl. */
export const researchHubUrlSchema = z
  .string()
  .min(1, 'URL is required')
  .superRefine((val, ctx) => {
    const result = validateResearchHubUrl(val.trim());
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error,
      });
    }
  });

/** Default when no state filter is selected; API requires config.state. */
export const DEFAULT_STATE = 'All States';

export const advancedConfigSchema = z.object({
  expertCount: z
    .number()
    .min(MIN_EXPERTS, `Must be at least ${MIN_EXPERTS}`)
    .max(MAX_EXPERTS, `Must be at most ${MAX_EXPERTS}`),
  expertiseLevel: z.array(z.enum(EXPERTISE_LEVELS_SPECIFIC)).default([]),
  region: z.enum(REGIONS as [Region, ...Region[]]),
  state: z.string(),
  gender: z.enum(GENDERS as [Gender, ...Gender[]]),
  excludedExpertNames: z.string(),
});

export const expertFinderFormSchema = z.object({
  url: researchHubUrlSchema,
  advanced: advancedConfigSchema,
});

export type ExpertFinderFormValues = z.infer<typeof expertFinderFormSchema>;
export type AdvancedConfigFormValues = z.infer<typeof advancedConfigSchema>;
