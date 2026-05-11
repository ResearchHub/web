export type SocialKey = 'x' | 'github' | 'linkedin' | 'rh';

export interface TeamMember {
  name: string;
  role: string;
  src: string;
  objectPosition?: string;
  links: Partial<Record<SocialKey, string>>;
}

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  x: 'X / Twitter',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  rh: 'ResearchHub',
};

export const SOCIAL_ORDER: readonly SocialKey[] = ['rh', 'linkedin', 'x', 'github'];

export const team: TeamMember[] = [
  {
    name: 'Brian Armstrong',
    role: 'Cofounder, CEO',
    src: '/team/brian.jpeg',
    links: {
      x: 'https://x.com/brian_armstrong',
      linkedin: 'https://www.linkedin.com/in/barmstrong/',
      rh: 'https://www.researchhub.com/author/11',
    },
  },
  {
    name: 'Patrick Joyce',
    role: 'Cofounder, COO',
    src: '/team/joyce.jpeg',
    links: {
      x: 'https://x.com/joycesticks',
      linkedin: 'https://www.linkedin.com/in/patrick-joyce-396b953b/',
      rh: 'https://www.researchhub.com/author/22',
    },
  },
  {
    name: 'Kobe Attias',
    role: 'Founding Engineer',
    src: '/team/kobe.png',
    links: {
      github: 'https://github.com/yattias',
      linkedin: 'https://www.linkedin.com/in/kobe-attias-5a9a9421/',
      rh: 'https://www.researchhub.com/author/549103',
    },
  },
  {
    name: 'Taki Koustomitis',
    role: 'Founding Engineer',
    src: '/team/taki.jpeg',
    links: {
      github: 'https://github.com/koutst',
      linkedin: 'https://www.linkedin.com/in/taki-k/',
      rh: 'https://www.researchhub.com/author/990291',
    },
  },
  {
    name: 'Tyler Diorio, PhD',
    role: 'Chief of Staff',
    src: '/team/tyler.png',
    objectPosition: 'center 10%',
    links: {
      x: 'https://x.com/TylerDiorio',
      linkedin: 'https://www.linkedin.com/in/tyler-diorio-351325aa/',
      rh: 'https://www.researchhub.com/author/956713',
    },
  },
];
