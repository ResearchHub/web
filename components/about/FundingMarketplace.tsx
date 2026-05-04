import { AboutContainer } from './AboutContainer';
import { Eyebrow } from './Eyebrow';
import { FundingPipeline } from './FundingPipeline';

export const FundingMarketplace = () => {
  return (
    <section id="funding" className="py-16 sm:py-20 md:py-28 lg:py-32 bg-white">
      <AboutContainer>
        <div className="grid gap-6 md:grid-cols-12 md:gap-10 items-start">
          <div className="md:col-span-5">
            <Eyebrow className="mb-4 sm:mb-5">§ 03 · Our features</Eyebrow>
            <h2
              className="font-medium tracking-[-0.022em] leading-[1.05] md:leading-[1.02] text-gray-900"
              style={{ fontSize: 'clamp(28px, 6vw, 56px)', textWrap: 'balance' }}
            >
              Funding <span className="italic font-light">Marketplace</span>
            </h2>
          </div>
          <div className="md:col-span-7 md:pt-6">
            <p className="text-base sm:text-[17px] md:text-[18px] leading-[1.6] text-gray-500">
              The funding marketplace links funding agencies with a global pool of researchers. It
              operates through a simple pipeline designed to promote transparency and
              reproducibility.
            </p>
          </div>
        </div>

        <FundingPipeline />
      </AboutContainer>
    </section>
  );
};
