'use client';

import { useAIUsage } from '@/hooks/useAIUsage';
import { Button } from '@/components/ui/Button';
import { Zap, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { AISubscriptionModal } from './AISubscriptionModal';

interface AIUsageBadgeProps {
  pollingInterval?: number;
}

export function AIUsageBadge({ pollingInterval = 30000 }: AIUsageBadgeProps) {
  const { usage, percentageUsed, isLoading } = useAIUsage(pollingInterval);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  if (isLoading || !usage) {
    return null;
  }

  const isNearLimit =
    percentageUsed && (percentageUsed.completions > 80 || percentageUsed.messages > 80);

  const resetTime = usage.reset_time ? new Date(usage.reset_time) : null;
  const resetTimeString = resetTime
    ? resetTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  return (
    <>
      <div className="relative group">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 ${isNearLimit ? 'text-orange-600' : 'text-gray-600'}`}
          onClick={() => setShowSubscriptionModal(true)}
        >
          {isNearLimit ? <AlertCircle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          <span className="text-xs font-medium">
            {usage.completions_limit - usage.completions_used} /{' '}
            {usage.messages_limit - usage.messages_used}
          </span>
        </Button>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span>Completions:</span>
                <span className="font-medium">
                  {usage.completions_used} / {usage.completions_limit}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Messages:</span>
                <span className="font-medium">
                  {usage.messages_used} / {usage.messages_limit}
                </span>
              </div>
              {resetTimeString && (
                <div className="pt-1 mt-1 border-t border-gray-700 text-gray-400">
                  Resets at {resetTimeString}
                </div>
              )}
            </div>

            {/* Progress bars */}
            <div className="mt-2 space-y-1">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    percentageUsed && percentageUsed.completions > 80
                      ? 'bg-orange-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${percentageUsed?.completions || 0}%` }}
                />
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    percentageUsed && percentageUsed.messages > 80 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${percentageUsed?.messages || 0}%` }}
                />
              </div>
            </div>

            {isNearLimit && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-orange-400">Click to upgrade</p>
              </div>
            )}

            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      </div>

      {showSubscriptionModal && (
        <AISubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}
    </>
  );
}
