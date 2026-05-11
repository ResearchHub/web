import { AboutContainer } from './AboutContainer';
import { SectionHeader } from './SectionHeader';
import { FundingPipeline } from './FundingPipeline';

export const FundingMarketplace = () => (
  <section
    id="funding"
    className="py-12 sm:py-16 md:py-24 lg:py-28 bg-white border-t border-gray-100"
  >
    <AboutContainer>
      <div className="grid gap-6 md:grid-cols-12 md:gap-10 items-start">
        <SectionHeader
          eyebrow="§ 03 · Our features"
          title={
            <>
              Funding <span className="italic font-light">Marketplace</span>
            </>
          }
          className="md:col-span-5"
        />
        <div className="md:col-span-7 md:pt-6">
          <p className="text-base sm:text-[17px] md:text-[18px] leading-[1.6] text-gray-500">
            The funding marketplace links funding agencies with a global pool of researchers. It
            operates through a simple pipeline designed to promote transparency and reproducibility.
          </p>
        </div>
      </div>

      <FundingPipeline />
    </AboutContainer>
  </section>
);
