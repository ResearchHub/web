import {
  Atom,
  Biohazard,
  Brain,
  Cpu,
  Dna,
  FlaskConical,
  HeartPulse,
  Hourglass,
  Leaf,
  Ribbon,
  Sparkles,
} from 'lucide-react';

/** Each topic's colors are whole class names so Tailwind keeps them. */
export const TOPICS = [
  {
    id: 'ai',
    label: 'AI & computing',
    blurb: 'Smarter tools that speed up discovery',
    Icon: Cpu,
    iconClassName: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'longevity',
    label: 'Aging & longevity',
    blurb: 'Why we age, and how to age better',
    Icon: Hourglass,
    iconClassName: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'cancer',
    label: 'Cancer research',
    blurb: 'New ways to find and fight tumors',
    Icon: Ribbon,
    iconClassName: 'bg-rose-100 text-rose-600',
  },
  {
    id: 'neuroscience',
    label: 'Brain & neuroscience',
    blurb: 'Memory, the mind and brain disease',
    Icon: Brain,
    iconClassName: 'bg-violet-100 text-violet-600',
  },
  {
    id: 'heart',
    label: 'Heart & metabolism',
    blurb: 'Heart disease, diabetes and diet',
    Icon: HeartPulse,
    iconClassName: 'bg-red-100 text-red-600',
  },
  {
    id: 'infections',
    label: 'Infectious disease',
    blurb: 'Viruses, vaccines and superbugs',
    Icon: Biohazard,
    iconClassName: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'genetics',
    label: 'Genetics & biotech',
    blurb: 'Reading and repairing our DNA',
    Icon: Dna,
    iconClassName: 'bg-teal-100 text-teal-600',
  },
  {
    id: 'environment',
    label: 'Climate & environment',
    blurb: 'Cleaner air, water and energy',
    Icon: Leaf,
    iconClassName: 'bg-green-100 text-green-600',
  },
  {
    id: 'physics',
    label: 'Physics & space',
    blurb: 'From particles to planets',
    Icon: Atom,
    iconClassName: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: 'chemistry',
    label: 'Chemistry & materials',
    blurb: 'New molecules, medicines and materials',
    Icon: FlaskConical,
    iconClassName: 'bg-cyan-100 text-cyan-600',
  },
  {
    id: 'other',
    label: 'Other',
    blurb: 'Wherever science needs it most',
    Icon: Sparkles,
    iconClassName: 'bg-gray-100 text-gray-600',
  },
] as const;

export type Topic = (typeof TOPICS)[number];
