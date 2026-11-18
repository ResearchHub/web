export const TOPICS = [
  { id: 'ai', label: 'AI & computing', blurb: 'Smarter tools that speed up discovery' },
  { id: 'longevity', label: 'Aging & longevity', blurb: 'Why we age, and how to age better' },
  { id: 'cancer', label: 'Cancer research', blurb: 'New ways to find and fight tumors' },
  {
    id: 'neuroscience',
    label: 'Brain & neuroscience',
    blurb: 'Memory, the mind and brain disease',
  },
  { id: 'heart', label: 'Heart & metabolism', blurb: 'Heart disease, diabetes and diet' },
  { id: 'infections', label: 'Infectious disease', blurb: 'Viruses, vaccines and superbugs' },
  { id: 'genetics', label: 'Genetics & biotech', blurb: 'Reading and repairing our DNA' },
  { id: 'environment', label: 'Climate & environment', blurb: 'Cleaner air, water and energy' },
  { id: 'physics', label: 'Physics & space', blurb: 'From particles to planets' },
  {
    id: 'chemistry',
    label: 'Chemistry & materials',
    blurb: 'New molecules, medicines and materials',
  },
  { id: 'other', label: 'Other', blurb: 'Wherever science needs it most' },
] as const;

export type Topic = (typeof TOPICS)[number];
