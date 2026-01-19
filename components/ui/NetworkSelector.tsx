'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { BaseMenu, BaseMenuItem } from './form/BaseMenu';
import { NETWORK_CONFIG, NetworkType } from '@/constants/tokens';
import { cn } from '@/utils/styles';

interface NetworkSelectorProps {
  value: NetworkType;
  onChange: (network: NetworkType) => void;
  disabled?: boolean;
  className?: string;
}

export function NetworkSelector({
  value,
  onChange,
  disabled = false,
  className,
}: NetworkSelectorProps) {
  const selectedNetwork = NETWORK_CONFIG[value];

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
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                value === 'BASE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              )}
            >
              {selectedNetwork.badge}
            </span>
          </div>
          <span className="text-xs text-gray-500">{selectedNetwork.description}</span>
        </div>
        <svg
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    ),
    [selectedNetwork, value, disabled, className]
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
              'flex items-start gap-3 px-3 py-3 rounded-md',
              isSelected && 'bg-primary-50'
            )}
          >
            <Image
              src={config.icon}
              alt={`${config.name} logo`}
              width={30}
              height={30}
              className="flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{config.name}</span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    network === 'BASE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  )}
                >
                  {config.badge}
                </span>
              </div>
              <span className={cn('text-xs', isSelected ? 'text-primary-700' : 'text-gray-500')}>
                {config.description}
              </span>
            </div>
            {isSelected && (
              <svg
                className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </BaseMenuItem>
        );
      })}
    </BaseMenu>
  );
}
