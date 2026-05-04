import { ReactNode } from 'react';
import { cn } from '@/utils/styles';
import { Eyebrow } from './Eyebrow';

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader = ({
  eyebrow,
  title,
  lead,
  align = 'left',
  className,
}: SectionHeaderProps) => {
  const isCenter = align === 'center';
  return (
    <div className={cn('max-w-3xl', isCenter && 'mx-auto text-center', className)}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <h2
        className="font-medium text-gray-900 leading-[1.05] tracking-[-0.02em] text-[clamp(28px,3.5vw,48px)]"
        style={{ textWrap: 'balance' }}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            'mt-5 text-[17px] md:text-[19px] leading-[1.55] text-gray-500 max-w-2xl',
            isCenter && 'mx-auto'
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
};
