import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { AboutContainer } from './AboutContainer';
import { Eyebrow } from './Eyebrow';
import { MonoLabel } from './MonoLabel';

const partnershipStats = [
  { value: '$150M+', label: 'Total impact', href: 'https://impact.endaoment.org/' },
  { value: '1.8M', label: 'Eligible orgs' },
];

export const PartnershipSection = () => (
  <section className="py-12 sm:py-16 md:py-24 lg:py-28 bg-white border-t border-gray-100">
    <AboutContainer>
      <div className="grid gap-8 md:grid-cols-12 md:gap-10 items-start">
        <div className="md:col-span-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <Eyebrow>§ 05 · Partnership</Eyebrow>
            <MonoLabel className="text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
              501(c)(3) Nonprofit
            </MonoLabel>
          </div>
          <h2
            className="font-medium tracking-[-0.022em] leading-[1.05] md:leading-[1.02] text-gray-900 text-[clamp(28px,6vw,56px)]"
            style={{ textWrap: 'balance' }}
          >
            Partnered with <span className="italic font-light">Nonprofits.</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-[17px] md:text-[18px] leading-[1.6] text-gray-500 max-w-md">
            Endaoment is a US 501(c)(3) nonprofit providing crypto-native donor-advised funds for
            science. Funders can give via DAF with the same speed and transparency as native RSC —
            and receive tax-deductible receipts.
          </p>

          <div className="mt-6 sm:mt-8">
            <a
              href="https://endaoment.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14px] text-gray-900 font-medium border-b border-gray-900 pb-1 hover:gap-3 transition-all"
            >
              Visit Endaoment <ExternalLink className="w-4 h-4" aria-hidden />
            </a>
          </div>
        </div>

        <div className="md:col-span-6">
          <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 md:p-10 flex flex-col items-center text-center shadow-sm">
            <MonoLabel className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mb-5 sm:mb-6">
              Powered by
            </MonoLabel>
            <Image
              src="/logos/endaoment-wordmark-color.png"
              alt="Endaoment"
              width={1080}
              height={250}
              className="w-full max-w-[220px] sm:max-w-[340px] h-auto"
            />

            <div className="mt-8 sm:mt-10 w-full grid grid-cols-2 gap-5 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-200">
              {partnershipStats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-medium tracking-[-0.02em] text-gray-900 leading-none text-[clamp(26px,5vw,40px)]">
                    {stat.value}
                  </div>
                  {stat.href ? (
                    <a
                      href={stat.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 hover:gap-2 transition-all"
                    >
                      <MonoLabel className="text-[10px] uppercase tracking-[0.16em] underline decoration-dotted underline-offset-4">
                        {stat.label}
                      </MonoLabel>
                      <ExternalLink className="w-3 h-3" aria-hidden />
                    </a>
                  ) : (
                    <MonoLabel className="mt-2 block text-[10px] uppercase tracking-[0.16em] text-gray-500">
                      {stat.label}
                    </MonoLabel>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AboutContainer>
  </section>
);
