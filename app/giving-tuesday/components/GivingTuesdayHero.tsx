import Link from 'next/link';
import { Bell, FileText } from 'lucide-react';
import { ShaderBackdrop } from '@/components/Auth/takeover/ShaderBackdrop';
import { Logo } from '@/components/ui/Logo';
import type { FeedGrantContent, FeedPostContent } from '@/types/feed';
import { GiftBuilder } from '@/app/giving-tuesday/components/GiftBuilder';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';

const TRUST_POINTS = [
  { label: 'Monthly updates from the lab', Icon: Bell },
  { label: 'A public plan for every project', Icon: FileText },
];

interface GivingTuesdayHeroProps {
  rfps: FeedGrantContent[];
  proposals: FeedPostContent[];
}

/** The pitch on the left of the spinning helix, and the two ways to give on the right. */
export function GivingTuesdayHero({ rfps, proposals }: GivingTuesdayHeroProps) {
  return (
    <section className="relative grid lg:min-h-[800px] lg:grid-cols-[46%_1fr]">
      <ShaderBackdrop backdrop="spinningHelix" layout="panel" className="absolute inset-0" />
      <header className="absolute inset-x-5 top-6 z-10 flex items-center justify-between lg:inset-x-10 lg:top-9">
        <Logo variant="white" size={28} loading="eager" />
        <Link href="/fund" className="text-sm font-medium text-white/80 hover:text-white">
          See all open RFPs
        </Link>
      </header>

      <div className="relative flex items-end px-5 pt-24 lg:px-10 lg:pb-10">
        <div className="w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-2xl lg:p-8">
          <p className="text-sm font-medium text-primary-600">Giving Tuesday · December 1</p>
          <h1
            className="mt-2 text-[34px] font-bold leading-[1.02] tracking-tight text-navy lg:text-[46px]"
            style={DISPLAY_FONT}
          >
            Fund <span className="text-primary-600">real research</span> this Giving Tuesday.
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Every gift is matched 1:1, so $100 becomes $200 for research.
          </p>
        </div>
      </div>

      <div className="relative flex flex-col justify-center px-5 py-8 lg:px-14 lg:py-14">
        <div className="mx-auto w-full max-w-[520px]">
          <GiftBuilder rfps={rfps} proposals={proposals} className="shadow-2xl" />
          <ul className="mt-8 grid grid-cols-2 gap-4">
            {TRUST_POINTS.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[13px] font-medium leading-tight text-white/85">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
