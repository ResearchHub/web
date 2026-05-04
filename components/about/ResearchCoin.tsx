import { ExternalLink } from 'lucide-react';
import { AboutContainer } from './AboutContainer';
import { Eyebrow } from './Eyebrow';
import { MonoLabel } from './MonoLabel';
import { Icon } from '@/components/ui/icons/Icon';
import { colors } from '@/app/styles/colors';

interface RscUseCase {
  number: string;
  tag: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}

const useCases: RscUseCase[] = [
  {
    number: '01',
    tag: 'Endowments',
    title: 'Earn high-yield Funding Credits',
    body: 'Endowments let committed funds keep earning, so more of every dollar goes toward science over time.',
    cta: 'How Endowments work',
    href: '#',
  },
  {
    number: '02',
    tag: 'Bounties',
    title: 'Reward the work that moves research forward',
    body: 'Researchers use RSC bounties to reward peer review, replication, data, and useful discussion.',
    cta: 'Browse open bounties',
    href: '/bounties',
  },
  {
    number: '03',
    tag: 'Self-funding',
    title: 'Fund your own research with what you earn',
    body: 'Earn RSC from community contributions, then put it back into your own proposals and bounties.',
    cta: 'Start a proposal',
    href: '/grants',
  },
];

export const ResearchCoin = () => {
  return (
    <section
      id="rsc"
      className="py-12 sm:py-16 md:py-24 lg:py-28 bg-white border-t border-gray-100"
    >
      <AboutContainer>
        <div className="grid gap-6 md:grid-cols-12 md:gap-10 items-start mb-8 sm:mb-12 md:mb-16">
          <div className="md:col-span-5">
            <Eyebrow className="mb-4 sm:mb-5">§ 04 · RSC</Eyebrow>
            <h2
              className="font-medium tracking-[-0.022em] leading-[1.05] md:leading-[1.02] text-gray-900"
              style={{ fontSize: 'clamp(28px, 6vw, 56px)', textWrap: 'balance' }}
            >
              The incentive layer <span className="italic font-light">for open science.</span>
            </h2>
          </div>
          <div className="md:col-span-7 md:pt-6">
            <p className="text-base sm:text-[17px] md:text-[18px] leading-[1.6] text-gray-500">
              <span className="text-gray-900 font-medium">ResearchCoin (RSC)</span> is an ERC20
              token that rewards the work that actually advances science — funding it, reviewing it,
              replicating it, discussing it.
            </p>
            <div className="mt-5 sm:mt-6 inline-flex w-full sm:w-auto items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0"
                aria-hidden
              >
                <Icon name="rscFlask" size={22} color="#ffffff" />
              </div>
              <div>
                <MonoLabel className="text-[12px] sm:text-[13px] text-gray-500 block">
                  ERC20 · Ethereum
                </MonoLabel>
                <div className="text-[16px] sm:text-[18px] font-medium text-gray-900">
                  ResearchCoin (RSC)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {useCases.map((useCase) => (
            <div
              key={useCase.number}
              className="relative rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-7 md:p-8 flex flex-col shadow-sm"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <MonoLabel className="text-[11px] text-gray-500">{useCase.number}</MonoLabel>
                <MonoLabel className="text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-full bg-white text-gray-500 border border-gray-200">
                  {useCase.tag}
                </MonoLabel>
              </div>
              <h3
                className="font-medium tracking-[-0.015em] text-gray-900 mb-3"
                style={{ fontSize: 'clamp(17px, 2.4vw, 22px)', textWrap: 'balance' }}
              >
                {useCase.title}
              </h3>
              <p className="hidden sm:block text-[14px] sm:text-[15px] leading-[1.55] text-gray-500 mb-4 sm:mb-6 flex-1">
                {useCase.body}
              </p>
              <a
                href={useCase.href}
                className="inline-flex items-center gap-2 text-[13px] text-gray-900 font-medium border-b border-gray-900 pb-1 self-start hover:gap-3 transition-all"
              >
                {useCase.cta} <ExternalLink className="w-3.5 h-3.5" aria-hidden />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-7 shadow-sm">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center flex-shrink-0"
              aria-hidden
            >
              <Icon name="rscFlask" size={18} color={colors.primary[500]} />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] sm:text-[15px] font-medium text-gray-900 leading-snug">
                Pay with RSC, DAF, credit card, or Apple Pay.
              </div>
              <div className="text-[13px] text-gray-500 mt-1 leading-snug">
                Funders choose their rails — we handle the conversion and custody.
              </div>
            </div>
          </div>
          <a
            href="https://docs.researchhub.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-between sm:justify-start gap-2 text-[14px] text-gray-900 font-medium border-t border-gray-100 pt-4 sm:border-t-0 sm:pt-0 sm:border-b sm:border-gray-900 sm:pb-1 transition-all hover:sm:gap-3"
          >
            <span>Read the RSC docs</span>
            <ExternalLink
              className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
              aria-hidden
            />
          </a>
        </div>
      </AboutContainer>
    </section>
  );
};
