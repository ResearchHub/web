import { ArrowDown, CalendarCheck, Landmark } from 'lucide-react';
import { ShaderBackdrop } from '@/components/Auth/takeover/ShaderBackdrop';
import { Logo } from '@/components/ui/Logo';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';

const PERKS = [
  { label: 'Tax-deductible through Endaoment, a 501(c)(3)', Icon: Landmark },
  { label: 'Set up on a short call with our team', Icon: CalendarCheck },
];

/** The pitch beside the spinning helix, led by the match, with one way in: down to the topics. */
export function GivingTuesdayHero() {
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
            Give to science. <span className="text-primary-600">We’ll match it.</span>
          </h1>
          <div className="mt-5 flex items-center gap-4 rounded-xl bg-primary-50 p-4">
            <span
              className="text-[40px] font-bold leading-none text-primary-600"
              style={DISPLAY_FONT}
            >
              1:1
            </span>
            <p className="text-[15px] leading-snug text-navy">
              Every gift made before 2027 is matched dollar for dollar, so $100,000 becomes $200,000
              for research.
            </p>
          </div>
          <ul className="mt-5 space-y-2">
            {PERKS.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm text-gray-600">
                <Icon className="h-4 w-4 shrink-0 text-primary-600" />
                {label}
              </li>
            ))}
          </ul>
          <a
            href="#topics"
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
