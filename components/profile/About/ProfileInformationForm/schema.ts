import { z } from 'zod';

// University schema
const UniversitySchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  createdDate: z.string().optional(),
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  state: z.string().optional(),
  updated_date: z.string().optional(),
});

// Degree and Year schema
const DegreeSchema = z.object({
  value: z.string(),
  label: z.string(),
});
const YearSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// Education entry schema
const EducationEntrySchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  is_public: z.boolean().optional(),
  major: z.string().optional(),
  name: z.string().optional(),
  summary: z.string().optional(),
  degree: DegreeSchema.optional(),
  university: UniversitySchema.optional(),
  year: YearSchema.optional(),
});

const httpsUrl = z
  .string()
  .optional()
  .refine((val) => !val || (val.startsWith('https://') && /^https:\/\/.+\..+/.test(val)), {
    message: 'Must be a valid https:// URL',
  })
  .refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Must be a valid URL',
  });

export type FormField =
  | 'first_name'
  | 'last_name'
  | 'headline'
  | 'description'
  | 'social_links'
  | 'education';

export const ALL_PROFILE_FIELDS: FormField[] = [
  'first_name',
  'last_name',
  'headline',
  'description',
  'social_links',
  'education',
];

// Main profile schema
// fields is an array of form fields to include in the schema
// if fields is empty, all fields are included
export const getProfileInformationSchema = ({ fields }: { fields: FormField[] }) =>
  z.object({
    first_name:
      !fields || fields.length === 0 || fields.includes('first_name')
        ? z.string().min(1, 'First name is required')
        : z.string().optional(),
    last_name:
      !fields || fields.length === 0 || fields.includes('last_name')
        ? z.string().min(1, 'Last name is required')
        : z.string().optional(),
    headline:
      !fields || fields.length === 0 || fields.includes('headline')
        ? z.string().max(50, 'Headline must be 50 characters or less').optional()
        : z.string().optional(),
    description:
      !fields || fields.length === 0 || fields.includes('description')
        ? z.string().max(250, 'About me must be 250 characters or less').optional()
        : z.string().optional(),
    google_scholar:
      !fields || fields.length === 0 || fields.includes('social_links')
        ? httpsUrl
        : z.string().optional(),
    linkedin:
      !fields || fields.length === 0 || fields.includes('social_links')
        ? httpsUrl
        : z.string().optional(),
    orcid_id:
      !fields || fields.length === 0 || fields.includes('social_links')
        ? httpsUrl
        : z.string().optional(),
    twitter:
      !fields || fields.length === 0 || fields.includes('social_links')
        ? httpsUrl
        : z.string().optional(),
    education: z.array(EducationEntrySchema).optional().default([]),
  });

export type ProfileInformationFormValues = z.infer<ReturnType<typeof getProfileInformationSchema>>;
