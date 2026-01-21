'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Check, ChevronDown } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from './form/BaseMenu';
import { NETWORK_CONFIG, NetworkType } from '@/constants/tokens';
import { cn } from '@/utils/styles';

interface NetworkSelectorProps {
  value: NetworkType;
  onChange: (network: NetworkType) => void;
  disabled?: boolean;
  className?: string;
  showBadges?: boolean;
  customBadges?: Partial<Record<NetworkType, string>>;
  showDescription?: boolean;
}

export function NetworkSelector({
  value,
  onChange,
  disabled = false,
  className,
  showBadges = true,
  customBadges,
  showDescription = true,
}: NetworkSelectorProps) {
  const selectedNetwork = NETWORK_CONFIG[value];

  const getBadge = (network: NetworkType): string | undefined => {
    if (customBadges && customBadges[network]) {
      return customBadges[network];
    }
    return NETWORK_CONFIG[network].badge;
  };

  const trigger = useMemo(
    () => (
      <div
        className={cn(
          'flex items-center gap-3 w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm',
          'hover:bg-gray-100 transition-colors cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <Image
          src={selectedNetwork.icon}
          alt={`${selectedNetwork.name} logo`}
          width={24}
          height={24}
          className="flex-shrink-0"
        />
        <div className="flex-1 flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{selectedNetwork.name}</span>
            {showBadges && getBadge(value) && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  value === 'BASE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                )}
              >
                {getBadge(value)}
              </span>
            )}
          </div>
          {showDescription && showBadges && selectedNetwork.description && (
            <span className="text-xs text-gray-500">{selectedNetwork.description}</span>
          )}
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    ),
    [selectedNetwork, value, disabled, className, showBadges, showDescription, customBadges]
  );

  return (
    <BaseMenu
      trigger={trigger}
      disabled={disabled}
      align="start"
      sideOffset={8}
      sameWidth={true}
      className="p-1"
    >
      {(Object.keys(NETWORK_CONFIG) as NetworkType[]).map((network) => {
        const config = NETWORK_CONFIG[network];
        const isSelected = network === value;

        return (
          <BaseMenuItem
            key={network}
            onSelect={() => {
              if (!disabled) {
                onChange(network);
              }
            }}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-md',
              isSelected && 'bg-primary-50'
            )}
          >
            <Image
              src={config.icon}
              alt={`${config.name} logo`}
              width={30}
              height={30}
              className="flex-shrink-0"
            />
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{config.name}</span>
                {showBadges && getBadge(network) && (
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      network === 'BASE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {getBadge(network)}
                  </span>
                )}
              </div>
              {showDescription && showBadges && config.description && (
                <span className={cn('text-xs', isSelected ? 'text-primary-700' : 'text-gray-500')}>
                  {config.description}
                </span>
              )}
            </div>
            {isSelected && <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />}
          </BaseMenuItem>
        );
      })}
    </BaseMenu>
  );
}
