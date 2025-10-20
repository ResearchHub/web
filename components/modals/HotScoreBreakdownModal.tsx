'use client';

import React from 'react';
import { HotScoreBreakdown } from '@/types/feed';
import { BaseModal } from '@/components/ui/BaseModal';

interface HotScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: HotScoreBreakdown;
  hotScore: number;
}

export function HotScoreBreakdownModal({
  isOpen,
  onClose,
  breakdown,
  hotScore,
}: HotScoreBreakdownModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hot Score Breakdown"
      maxWidth="max-w-3xl"
      padding="p-6"
    >
      <div className="space-y-4 text-left">
        {/* Header */}
        <div className="pb-3 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Final Score: <span className="font-bold text-orange-600">{hotScore}</span>
          </p>
        </div>

        {/* Steps Section */}
        {breakdown.steps && breakdown.steps.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Calculation Steps:</h5>
            <div className="bg-gray-50 rounded p-4 font-mono text-xs text-gray-800 whitespace-pre-wrap">
              {breakdown.steps.join('\n')}
            </div>
          </div>
        )}

        {/* Equation Section */}
        {breakdown.equation && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Formula:</h5>
            <div className="bg-gray-50 rounded p-4 font-mono text-xs text-gray-800 break-words">
              {breakdown.equation}
            </div>
          </div>
        )}

        {/* Signals Section */}
        {breakdown.signals && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Signals:</h5>
            <div className="bg-gray-50 rounded p-4">
              <pre className="font-mono text-xs text-gray-800 overflow-x-auto text-left">
                {JSON.stringify(breakdown.signals, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Calculation Details Section */}
        {breakdown.calculation && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Calculation Details:</h5>
            <div className="bg-gray-50 rounded p-4">
              <pre className="font-mono text-xs text-gray-800 overflow-x-auto text-left">
                {JSON.stringify(breakdown.calculation, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Time Factors Section */}
        {breakdown.time_factors && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Time Factors:</h5>
            <div className="bg-gray-50 rounded p-4">
              <pre className="font-mono text-xs text-gray-800 overflow-x-auto text-left">
                {JSON.stringify(breakdown.time_factors, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Config Snapshot Section */}
        {breakdown.config_snapshot && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Config Snapshot:</h5>
            <div className="bg-gray-50 rounded p-4">
              <pre className="font-mono text-xs text-gray-800 overflow-x-auto text-left">
                {JSON.stringify(breakdown.config_snapshot, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
