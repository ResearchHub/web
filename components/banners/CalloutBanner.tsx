'use client';

import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

export type CalloutBannerTone = 'blue' | 'amber';

interface CalloutBannerProps {
  tone?: CalloutBannerTone;
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  onCtaClick: () => void;
  className?: string;
}

const TONE_STYLES: Record<
  CalloutBannerTone,
  { container: string; iconBg: string; iconColor: string; ctaButton: string }
> = {
  blue: {
    container: 'bg-blue-50 text-blue-900 border border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    ctaButton: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  amber: {
    container: 'bg-yellow-50 text-yellow-900 border border-yellow-200',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    ctaButton: 'bg-yellow-600 text-white hover:bg-yellow-700',
  },
};

export function CalloutBanner({
  tone = 'blue',
  icon,
  title,
  description,
  ctaLabel,
  onCtaClick,
  className,
}: CalloutBannerProps) {
  const styles = TONE_STYLES[tone];
  return (
    <div
      className={cn(
        'mb-6 rounded-lg px-4 py-4 flex items-center gap-4',
        styles.container,
        className
      )}
    >
      <div
        className={cn(
          'shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
          styles.iconBg,
          styles.iconColor
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-sm opacity-90 mt-0.5 hidden sm:block">{description}</p>
      </div>
      <Button
        onClick={onCtaClick}
        size="default"
        className={cn(
          'shrink-0 font-medium px-4 inline-flex items-center gap-1.5',
          styles.ctaButton
        )}
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
