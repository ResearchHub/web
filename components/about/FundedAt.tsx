import Image from 'next/image';
import { AboutContainer } from './AboutContainer';
import { MonoLabel } from './MonoLabel';
import { fundedInstitutions } from './data/fundedInstitutions';

export const FundedAt = () => {
  return (
    <section className="relative py-10 sm:py-14 md:py-16 lg:py-20 bg-gray-50">
      <AboutContainer>
        <div className="flex flex-col items-center text-center">
          <MonoLabel className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-gray-500">
            <span className="h-px w-8 bg-gray-200" />
            Funding researchers at
            <span className="h-px w-8 bg-gray-200" />
          </MonoLabel>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10">
          {fundedInstitutions.map((institution) => (
            <div
              key={institution.name}
              className="relative h-12 flex items-center justify-center"
              style={{ flex: '0 1 clamp(118px, 42vw, 170px)' }}
              title={institution.name}
            >
              <Image
                src={institution.src}
                alt={institution.name}
                width={160}
                height={48}
                className="w-auto h-auto object-contain"
                style={{ maxWidth: '100%', maxHeight: 42 }}
              />
            </div>
          ))}
        </div>
      </AboutContainer>
    </section>
  );
};
