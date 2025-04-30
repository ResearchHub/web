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

// Main profile schema
export const getProfileInformationSchema = (simplified: boolean = false) =>
  z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    headline: z.string().optional(),
    description: z.string().optional(),
    google_scholar: httpsUrl,
    linkedin: httpsUrl,
    orcid_id: httpsUrl,
    twitter: httpsUrl,
    education: z
      .array(
        z.object({
          id: z.union([z.string(), z.number()]).optional(),
          is_public: z.boolean().optional(),
          major: z.string().optional(),
          name: z.string().optional(),
          summary: z.string().optional(),
          degree: z.object({ value: z.string(), label: z.string() }).optional(),
          university: z
            .object({
              id: z.union([z.string(), z.number()]),
              name: z.string(),
              city: z.string().optional(),
              country: z.string().optional(),
              createdDate: z.string().optional(),
              state: z.string().optional(),
              updated_date: z.string().optional(),
            })
            .optional(),
          year: z.object({ value: z.string(), label: z.string() }).optional(),
        })
      )
      .optional()
      .default([]),
  });

export type ProfileInformationFormValues = z.infer<ReturnType<typeof getProfileInformationSchema>>;
