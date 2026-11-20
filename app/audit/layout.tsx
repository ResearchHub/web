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
    title: 'Fund the audit of biomedical research.',
    description:
      'AI can now audit scientific papers at a fraction of the cost and time it once took. We are raising funds to audit biomedical research, so that the results science builds on hold up.',
    url: '/audit',
  }),
  title: {
    default: 'Auditing biomedical research: request for proposals',
    template: `%s | ${SITE_CONFIG.name}`,
  },
  // Not indexed until the call's terms are final (see CAMPAIGN in data/rfp.ts).
  robots: { index: false, follow: false },
};

export default function AuditLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuditShell fontClassName={`${serif.variable} ${mono.variable}`}>{children}</AuditShell>;
}
