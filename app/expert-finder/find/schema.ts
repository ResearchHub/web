import { z } from 'zod';
import { ExpertiseLevel, InputType, Region } from '@/services/expertFinder.service';

const INPUT_TYPES: InputType[] = ['abstract', 'pdf', 'full_content'];

export const EXPERT_COUNT_OPTIONS = [5, 10, 25, 50, 100] as const;
export type ExpertCountOption = (typeof EXPERT_COUNT_OPTIONS)[number];

export const DEFAULT_STATE = 'All States';

export const EXPERTISE_LEVELS_SPECIFIC: [ExpertiseLevel, ...ExpertiseLevel[]] = [
  'phd_postdocs',
  'early_career',
  'mid_career',
  'top_expert',
];

export const REGION_VALUES: [Region, ...Region[]] = [
  'all_regions',
  'us',
  'non_us',
  'europe',
  'asia_pacific',
  'africa_mena',
];

export const advancedConfigSchema = z.object({
  expertCount: z.number().default(25),
  expertiseLevel: z.array(z.enum(EXPERTISE_LEVELS_SPECIFIC)).default([]),
  region: z.enum(REGION_VALUES),
  state: z.string(),
  excludedExpertNames: z.string(),
  inputType: z.enum(INPUT_TYPES as [InputType, ...InputType[]]).default('full_content'),
  searchTitle: z.string().optional().default(''),
});

export const DOCUMENT_REQUIRED_MESSAGE =
  'Document is required. Paste a ResearchHub URL and click the checkmark to select a document.';

export const expertFinderFormSchema = z
  .object({
    unifiedDocumentId: z.number().nullable().default(null),
    url: z.string().optional().default(''),
    advanced: advancedConfigSchema,
  })
  .refine((data) => data.unifiedDocumentId != null, {
    message: DOCUMENT_REQUIRED_MESSAGE,
    path: ['unifiedDocumentId'],
  });

export type ExpertFinderFormValues = z.infer<typeof expertFinderFormSchema>;
export type AdvancedConfigFormValues = z.infer<typeof advancedConfigSchema>;
