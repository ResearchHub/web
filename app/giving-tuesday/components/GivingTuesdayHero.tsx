import { ArrowDown } from 'lucide-react';
import { ShaderBackdrop } from '@/components/Auth/takeover/ShaderBackdrop';
import { Logo } from '@/components/ui/Logo';
import { formatCompactAmount } from '@/utils/currency';
import { getNeededUsd, type GiftProposal } from '@/app/giving-tuesday/lib/giftProposals';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';

/** The pitch beside the spinning helix, with one way in: down to the causes. */
export function GivingTuesdayHero({ proposals }: Readonly<{ proposals: GiftProposal[] }>) {
  const neededUsd = proposals.reduce((sum, proposal) => sum + getNeededUsd(proposal), 0);
  const openCount = proposals.filter((proposal) => getNeededUsd(proposal) > 0).length;

  return (
    <section className="relative grid lg:min-h-[720px] lg:grid-cols-[46%_1fr]">
      <ShaderBackdrop backdrop="spinningHelix" layout="panel" className="absolute inset-0" />
      <header className="absolute inset-x-5 top-6 z-10 lg:inset-x-10 lg:top-9">
        <Logo variant="white" size={28} loading="eager" />
      </header>

      <div className="relative flex items-end px-5 pb-10 pt-24 lg:px-10">
        <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-2xl lg:p-8">
          <p className="text-sm font-medium text-primary-600">Giving Tuesday · December 1</p>
          <h1
            className="mt-2 text-[34px] font-bold leading-[1.02] tracking-tight text-navy lg:text-[46px]"
            style={DISPLAY_FONT}
          >
            Fund the <span className="text-primary-600">science</span> you care about.
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Give to a real research project at a nonprofit, in cancer, brain health, infectious
            disease and more. Your gift is tax-deductible, and every gift in December is matched
            1:1.
          </p>
          {neededUsd > 0 && (
            <p className="mt-5 text-gray-600">
              <span className="text-2xl font-bold text-navy" style={DISPLAY_FONT}>
                {formatCompactAmount(neededUsd)}
              </span>{' '}
              still needed across {openCount} projects
            </p>
          )}
          <a
            href="#causes"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-primary-600 px-6 text-base font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Gift to Science
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
