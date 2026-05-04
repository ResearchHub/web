import Image from 'next/image';
import { AboutContainer } from './AboutContainer';
import { MonoLabel } from './MonoLabel';
import { fundedInstitutions } from './data/fundedInstitutions';

export const FundedAt = () => {
  return (
    <section className="relative py-12 sm:py-14 md:py-16 lg:py-20 bg-gray-50">
      <AboutContainer>
        <div className="flex flex-col items-center text-center">
          <MonoLabel className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-gray-500">
            <span className="h-px w-8 bg-gray-200" />
            Funding researchers at
            <span className="h-px w-8 bg-gray-200" />
          </MonoLabel>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 items-center justify-items-center">
          {fundedInstitutions.map((institution) => (
            <div
              key={institution.name}
              className="relative h-12 sm:h-14 w-full flex items-center justify-center"
              title={institution.name}
            >
              <Image
                src={institution.src}
                alt={institution.name}
                width={160}
                height={48}
                className="max-h-10 sm:max-h-12 max-w-[140px] sm:max-w-[160px] w-auto h-auto object-contain"
              />
            </div>
          ))}
        </div>
      </AboutContainer>
    </section>
  );
};
