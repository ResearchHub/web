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
    body: 'With our Endowments feature, principal deposits automatically earn high-yield Funding Credits — so every dollar you commit funds more science over time, instead of sitting idle in a grant account.',
    cta: 'How Endowments work',
    href: '#',
  },
  {
    number: '02',
    tag: 'Bounties',
    title: 'Reward the work that moves research forward',
    body: 'Researchers post RSC bounties for peer review, replication, data, and discussion. Rewards scale with community-judged value (upvotes), and turnaround averages under 10 days.',
    cta: 'Browse open bounties',
    href: '/bounties',
  },
  {
    number: '03',
    tag: 'Self-funding',
    title: 'Fund your own research with what you earn',
    body: 'RSC you earn from peer reviewing, sharing data, or moderating can be pooled straight into your own proposals and bounties — turning community contributions into a compounding research budget for your lab.',
    cta: 'Start a proposal',
    href: '/grants',
  },
];

export const ResearchCoin = () => {
  return (
    <section id="rsc" className="py-12 sm:py-20 md:py-28 lg:py-32 bg-primary-50">
      <AboutContainer>
        <div className="grid gap-8 md:grid-cols-12 md:gap-12 items-start mb-10 sm:mb-12 md:mb-20">
          <div className="md:col-span-5 md:sticky md:top-24">
            <Eyebrow className="mb-4 sm:mb-5">§ 04 · RSC</Eyebrow>
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0"
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
            <h2
              className="font-medium tracking-[-0.022em] leading-[1.05] md:leading-[1.02] text-gray-900"
              style={{ fontSize: 'clamp(26px, 5.5vw, 44px)', textWrap: 'balance' }}
            >
              The incentive layer <br className="hidden md:block" />
              <span className="italic font-light">for open science.</span>
            </h2>
          </div>
          <div className="md:col-span-7 text-base sm:text-[17px] leading-[1.65] text-gray-500 space-y-4 sm:space-y-5">
            <p>
              <span className="text-gray-900 font-medium">ResearchCoin (RSC)</span> is an ERC20
              token that rewards the work that actually advances science — funding it, reviewing it,
              replicating it, discussing it.
            </p>
            <p>
              Instead of static grant dollars and unpaid peer review, RSC turns every step of the
              research lifecycle into something the community can fund, reward, and track
              transparently on-chain.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {useCases.map((useCase) => (
            <div
              key={useCase.number}
              className="relative rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-7 md:p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <MonoLabel className="text-[11px] text-gray-500">{useCase.number}</MonoLabel>
                <MonoLabel className="text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-full bg-primary-50 text-gray-500 border border-gray-200">
                  {useCase.tag}
                </MonoLabel>
              </div>
              <h3
                className="font-medium tracking-[-0.015em] text-gray-900 mb-3"
                style={{ fontSize: 'clamp(17px, 2.4vw, 22px)', textWrap: 'balance' }}
              >
                {useCase.title}
              </h3>
              <p className="text-[14px] sm:text-[15px] leading-[1.55] text-gray-500 mb-4 sm:mb-6 flex-1">
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

        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-7">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0"
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
