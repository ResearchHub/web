import Image from 'next/image';
import { AboutContainer } from './AboutContainer';
import { SectionHeader } from './SectionHeader';
import { team, SOCIAL_LABELS, SOCIAL_ORDER } from './data/team';
import { TeamSocialIcon } from './TeamSocialIcon';

export const TeamSection = () => (
  <section className="py-12 sm:py-16 md:py-24 lg:py-28 bg-white border-t border-gray-100">
    <AboutContainer>
      <SectionHeader
        eyebrow="§ 06 · Team"
        title={
          <>
            A small team of <span className="italic font-light">passionate people.</span>
          </>
        }
      />
      <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {team.map((member) => (
          <div
            key={member.name}
            className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
          >
            <div className="aspect-[5/4] bg-gray-100 overflow-hidden">
              <Image
                src={member.src}
                alt={member.name}
                width={400}
                height={500}
                className="w-full h-full object-cover"
                style={{ objectPosition: member.objectPosition ?? 'top' }}
              />
            </div>
            <div className="p-3 sm:p-4 border-t border-gray-200">
              <div className="text-[14px] sm:text-[16px] font-medium text-gray-900">
                {member.name}
              </div>
              <div className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5">{member.role}</div>
              <div className="mt-2.5 pt-2.5 sm:mt-3 sm:pt-3 border-t border-gray-200 flex items-center gap-2 sm:gap-3">
                {SOCIAL_ORDER.map((key) => {
                  const href = member.links[key];
                  if (!href) return null;
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on ${SOCIAL_LABELS[key]}`}
                      title={SOCIAL_LABELS[key]}
                      className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center transition-colors hover:bg-gray-50 hover:border-gray-300"
                    >
                      <TeamSocialIcon kind={key} className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AboutContainer>
  </section>
);
