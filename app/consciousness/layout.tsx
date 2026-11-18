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

// The other graphic sets' display faces (theme.ts DISPLAY). Poster is the
// page's own set, so its face is preloaded; the rest serve only the design
// review sets (`?design=1&set=…`) and load when one of those is on screen.
const poster = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-orch-poster',
  display: 'swap',
});
const clay = Fredoka({
  subsets: ['latin'],
  variable: '--font-orch-clay',
  display: 'swap',
  preload: false,
});
const spectral = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-orch-spectral',
  display: 'swap',
  preload: false,
});
const engraved = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-orch-engraved',
  display: 'swap',
  preload: false,
});
const micrograph = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-orch-micrograph',
  display: 'swap',
  preload: false,
});
const FONT_VARS = [serif, poster, clay, spectral, engraved, micrograph]
  .map((f) => f.variable)
  .join(' ');

export const metadata: Metadata = {
  ...buildOpenGraphMetadata({
    title: 'Fund the experiments that could explain consciousness.',
    description:
      'Fund experiments and theory on how consciousness arises, from whether an AI could be conscious to whether experience needs quantum physics. Evidence for and against any answer is funded on equal terms.',
    url: '/consciousness',
    // The RFP's cover, cropped to 1200×630 for link previews.
    image: '/consciousness/og.jpg',
  }),
  title: {
    default: 'Consciousness research: request for proposals',
    template: `%s | ${SITE_CONFIG.name}`,
  },
};

export default function OrchOrLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <OrchShell fontClassName={FONT_VARS}>{children}</OrchShell>;
}
