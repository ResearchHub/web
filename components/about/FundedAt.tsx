import Image from 'next/image';
import { AboutContainer } from './AboutContainer';
import { MonoLabel } from './MonoLabel';
import { fundedInstitutions } from './data/fundedInstitutions';

export const FundedAt = () => {
  return (
    <section className="relative py-10 sm:py-14 md:py-16 lg:py-20 bg-white border-y border-gray-100">
      <AboutContainer>
        <div className="flex flex-col items-center text-center">
          <MonoLabel className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-gray-500">
            <span className="h-px w-8 bg-gray-200" />
            Funding researchers at
            <span className="h-px w-8 bg-gray-200" />
          </MonoLabel>
        </div>

        <div
          className="mt-8 sm:mt-10 -mx-4 sm:-mx-6 md:-mx-10 overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(90deg, transparent 0, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0, black 10%, black 90%, transparent 100%)',
          }}
        >
          <div className="flex w-max items-center gap-10 sm:gap-12 animate-logo-marquee motion-reduce:animate-none">
            {[0, 1].map((setIndex) => (
              <div
                key={setIndex}
                className="flex items-center gap-10 sm:gap-12"
                aria-hidden={setIndex === 1}
              >
                {fundedInstitutions.map((institution) => (
                  <div
                    key={`${setIndex}-${institution.name}`}
                    className="relative h-14 w-[160px] sm:w-[180px] flex-none flex items-center justify-center"
                    title={institution.name}
                  >
                    <Image
                      src={institution.src}
                      alt={institution.name}
                      width={180}
                      height={54}
                      className="max-h-11 sm:max-h-12 max-w-full w-auto h-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </AboutContainer>
    </section>
  );
};
