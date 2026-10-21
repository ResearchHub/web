import { BookOpen, Info, LifeBuoy, type LucideIcon } from 'lucide-react';
import { faXTwitter, faDiscord, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

/** The help links the sidebar's "Help & resources" menu and the phone's You panel share. */
export const RESOURCE_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Docs', href: 'https://docs.researchhub.com/', icon: BookOpen },
  {
    label: 'Support',
    href: 'https://airtable.com/appuhMJaf1kb3ic8e/pagYeh6cB9sgiTIgx/form',
    icon: LifeBuoy,
  },
  { label: 'About', href: 'https://www.researchhub.com/about', icon: Info },
];

export const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/researchhub', icon: faXTwitter },
  { label: 'Discord', href: 'https://discord.com/invite/ZcCYgcnUp5', icon: faDiscord },
  { label: 'GitHub', href: 'https://github.com/ResearchHub', icon: faGithub },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/researchhubtechnologies',
    icon: faLinkedin,
  },
];

export const LEGAL_LINKS = [
  { label: 'Terms', href: 'https://www.researchhub.com/tos' },
  { label: 'Privacy', href: 'https://www.researchhub.com/privacy' },
];

export const CURRENCIES = ['USD', 'RSC'] as const;
export type CurrencyOption = (typeof CURRENCIES)[number];
