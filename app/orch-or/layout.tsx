import { Metadata } from 'next';
import {
  Bricolage_Grotesque,
  Fraunces,
  Fredoka,
  IM_Fell_English,
  Instrument_Serif,
  Space_Grotesk,
} from 'next/font/google';
import { buildOpenGraphMetadata, SITE_CONFIG } from '@/lib/metadata';
import { OrchShell } from './components/OrchShell';
import './orch.css';

// A display serif with optical sizes for headlines; body text stays in Geist.
const serif = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-orch-serif',
  display: 'swap',
});

// The other graphic sets' display faces (theme.ts DISPLAY). Each file only
// downloads when a set that uses it is on screen.
const poster = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-orch-poster',
  display: 'swap',
});
const clay = Fredoka({ subsets: ['latin'], variable: '--font-orch-clay', display: 'swap' });
const spectral = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-orch-spectral',
  display: 'swap',
});
const engraved = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-orch-engraved',
  display: 'swap',
});
const micrograph = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-orch-micrograph',
  display: 'swap',
});
const FONT_VARS = [serif, poster, clay, spectral, engraved, micrograph]
  .map((f) => f.variable)
  .join(' ');

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'Is consciousness a quantum process? Request for proposals',
    description:
      'The Athanatos Foundation funds experiments and theory on how consciousness arises, from whether it can be computed to whether it needs quantum physics. Evidence for and against any answer is funded on equal terms.',
    url: '/orch-or',
  }),
  title: {
    default: 'Consciousness research: request for proposals',
    template: `%s | ${SITE_CONFIG.name}`,
  },
  // A preview with placeholder figures.
  robots: { index: false, follow: false },
};

export default function OrchOrLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <OrchShell fontClassName={FONT_VARS}>{children}</OrchShell>;
}
