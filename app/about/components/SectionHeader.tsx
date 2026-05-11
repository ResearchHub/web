import { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}

export const SectionHeader = ({ eyebrow, title, lead, className }: SectionHeaderProps) => (
  <div className={className}>
    {eyebrow && <Eyebrow className="mb-4 sm:mb-5">{eyebrow}</Eyebrow>}
    <h2
      className="font-medium text-gray-900 leading-[1.05] md:leading-[1.02] tracking-[-0.022em] text-[clamp(28px,6vw,56px)]"
      style={{ textWrap: 'balance' }}
    >
      {title}
    </h2>
    {lead && (
      <p className="mt-4 sm:mt-6 text-base sm:text-[17px] md:text-[18px] leading-[1.6] text-gray-500">
        {lead}
      </p>
    )}
  </div>
);
