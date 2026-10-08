import { z } from 'zod';
import {
  ExpertiseLevel,
  EXPERT_COUNT_OPTIONS,
  EXPERT_SEARCH_ADDITIONAL_CONTEXT_MAX_LENGTH,
  EXPERT_SEARCH_ENGINES,
  getExpertCountOptions,
  InputType,
  Region,
  type ExpertCountOption,
  type ExpertSearchEngine,
} from '@/services/expertFinder.service';

const INPUT_TYPES: InputType[] = ['abstract', 'pdf', 'full_content'];

export { EXPERT_COUNT_OPTIONS };
export type { ExpertCountOption, ExpertSearchEngine };

export const DEFAULT_STATE = 'All States';

export const EXPERTISE_LEVELS_SPECIFIC: [ExpertiseLevel, ...ExpertiseLevel[]] = [
  'all_levels',
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

export const ENGINE_VALUES: [ExpertSearchEngine, ...ExpertSearchEngine[]] = [
  ...EXPERT_SEARCH_ENGINES,
];

export const advancedConfigSchema = z
  .object({
    engine: z.enum(ENGINE_VALUES).default('advanced'),
    expertCount: z.number(),
    expertiseLevel: z.array(z.enum(EXPERTISE_LEVELS_SPECIFIC)).default([]),
    region: z.enum(REGION_VALUES),
    state: z.string(),
    inputType: z.enum(INPUT_TYPES as [InputType, ...InputType[]]).default('full_content'),
    searchName: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    const options = getExpertCountOptions(data.engine);
    if (!(options as readonly number[]).includes(data.expertCount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Must be ${options.join(', ')}`,
        path: ['expertCount'],
      });
    }
  });

export const DOCUMENT_REQUIRED_MESSAGE =
  'Document is required. Paste a ResearchHub URL and click the checkmark to select a document.';

export const expertFinderFormSchema = z
  .object({
    unifiedDocumentId: z.number().nullable().default(null),
    url: z.string().optional().default(''),
    additionalContext: z.string().max(EXPERT_SEARCH_ADDITIONAL_CONTEXT_MAX_LENGTH).default(''),
    advanced: advancedConfigSchema,
  })
  .refine((data) => data.unifiedDocumentId != null, {
    message: DOCUMENT_REQUIRED_MESSAGE,
    path: ['unifiedDocumentId'],
  });

export type ExpertFinderFormValues = z.infer<typeof expertFinderFormSchema>;
export type AdvancedConfigFormValues = z.infer<typeof advancedConfigSchema>;
