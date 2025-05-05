'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Check, LucideIcon } from 'lucide-react';
import { Icon } from '../ui/icons/Icon';

export type BannerVariant = 'default' | 'alt-blue';

export interface FeatureItem {
  text: string;
  highlight?: boolean; // Default: false, optional boolean to highlight the text
  icon?: LucideIcon; // Default: Check icon, optional Lucide icon
}

export interface RHJBannerProps {
  variant?: BannerVariant;
  features: FeatureItem[]; //Array of feature items to display in the banner
  title?: string;
  subtitle?: string;
  buttonText?: string;
  submitUrl?: string;
  className?: string;
}

export function RHJBanner({
  variant = 'default',
  features = [],
  title = 'Publish Faster with RHJ',
  subtitle,
  buttonText = 'Submit Your Manuscript →',
  submitUrl = '/paper/create',
  className = '',
}: RHJBannerProps) {
  const router = useRouter();
  const variantStyles = {
    default:
      'bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm space-y-3',
    'alt-blue': 'bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 p-5 space-y-3',
  };

  const isAltBlue = variant === 'alt-blue';

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      <h3
        className={`text-lg font-semibold ${isAltBlue ? 'text-indigo-800 mb-1' : 'text-center text-blue-800 mb-1'} flex items-center gap-2`}
      >
        <Icon name="rhJournal2" size={20} color="currentColor" />
        {title}
      </h3>

      {isAltBlue && subtitle && <p className="text-indigo-700 mb-3 text-sm">{subtitle}</p>}

      {features.length > 0 && (
        <ul className={isAltBlue ? 'text-indigo-700 mb-4 text-sm space-y-1' : 'space-y-3'}>
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon || Check;

            return (
              <li
                key={index}
                className={
                  isAltBlue
                    ? 'flex items-center gap-2'
                    : 'flex items-start space-x-3 text-gray-700 text-sm'
                }
              >
                {isAltBlue ? (
                  <FeatureIcon className="w-4 h-4 flex-shrink-0 text-indigo-500" strokeWidth={3} />
                ) : (
                  <div className="bg-blue-100 rounded-full p-1 mt-0">
                    <FeatureIcon className="text-blue-600 w-3.5 h-3.5 flex-shrink-0" />
                  </div>
                )}
                <span className={isAltBlue && feature.highlight ? 'font-bold' : 'font-medium'}>
                  {feature.text}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        variant="default"
        size="md"
        className={
          isAltBlue
            ? 'w-full bg-indigo-600 hover:bg-indigo-700'
            : 'w-full font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm'
        }
        onClick={() => router.push(submitUrl)}
      >
        {buttonText}
      </Button>
    </div>
  );
}
