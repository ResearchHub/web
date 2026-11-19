import { Metadata } from 'next';
import { IBM_Plex_Mono, Newsreader } from 'next/font/google';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';
import { AuditShell } from './components/AuditShell';
import './audit.css';

// A text serif with optical sizes: headlines and reading text are set like
// the papers the page is about. Labels and figures use a mono; controls
// stay in Geist.
const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-audit-serif',
  display: 'swap',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-audit-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'Fund the audit of everything science has published.',
    description:
      'A machine audit of one field of astrophysics reported 872 errors in 433 papers; 47 had ever been challenged in print. We are raising a pool to audit more fields in the open, with experts checking what the machines flag.',
    url: '/audit',
  }),
  title: {
    default: 'Auditing the scientific literature: request for proposals',
    template: `%s | ${SITE_CONFIG.name}`,
  },
  // Not indexed until the call's terms are final (see CAMPAIGN in data/rfp.ts).
  robots: { index: false, follow: false },
};

export default function AuditLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuditShell fontClassName={`${serif.variable} ${mono.variable}`}>{children}</AuditShell>;
}
