import {
  Biohazard,
  Brain,
  BrainCircuit,
  FlaskConical,
  HeartPulse,
  Hourglass,
  Leaf,
  Ribbon,
} from 'lucide-react';

/** Each cause's colors are whole class names so Tailwind keeps them. */
export const CAUSES = [
  {
    id: 'cancer',
    label: 'Cancer research',
    blurb: 'New ways to find and fight tumors',
    Icon: Ribbon,
    tagClassName: 'bg-rose-50 text-rose-700',
    iconClassName: 'bg-rose-100 text-rose-600',
  },
  {
    id: 'longevity',
    label: 'Aging & longevity',
    blurb: 'Why we age, and how to age better',
    Icon: Hourglass,
    tagClassName: 'bg-emerald-50 text-emerald-700',
    iconClassName: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'alzheimers',
    label: 'Alzheimer’s & brain aging',
    blurb: 'Protecting memory as we get older',
    Icon: Brain,
    tagClassName: 'bg-violet-50 text-violet-700',
    iconClassName: 'bg-violet-100 text-violet-600',
  },
  {
    id: 'brain',
    label: 'Brain & mental health',
    blurb: 'Autism, PTSD, memory and the mind',
    Icon: BrainCircuit,
    tagClassName: 'bg-indigo-50 text-indigo-700',
    iconClassName: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: 'infections',
    label: 'Viruses & infections',
    blurb: 'HIV, Ebola and drug-resistant bacteria',
    Icon: Biohazard,
    tagClassName: 'bg-amber-50 text-amber-700',
    iconClassName: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'heart',
    label: 'Heart, gut & metabolism',
    blurb: 'Diet, heart disease and gut health',
    Icon: HeartPulse,
    tagClassName: 'bg-orange-50 text-orange-700',
    iconClassName: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'environment',
    label: 'Environment & health',
    blurb: 'What’s in our water, air and food',
    Icon: Leaf,
    tagClassName: 'bg-sky-50 text-sky-700',
    iconClassName: 'bg-sky-100 text-sky-600',
  },
  {
    id: 'tools',
    label: 'New tools for science',
    blurb: 'AI, apps and lab methods',
    Icon: FlaskConical,
    tagClassName: 'bg-cyan-50 text-cyan-700',
    iconClassName: 'bg-cyan-100 text-cyan-600',
  },
] as const;

export type CauseId = (typeof CAUSES)[number]['id'];
