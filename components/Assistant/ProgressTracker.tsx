'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, Sparkles, Circle } from 'lucide-react';
import type { AssistantRole, FieldUpdate } from '@/types/assistant';
import { getFieldsForRole, countCompleted } from './lib/fieldDefinitions';

interface ProgressTrackerProps {
  role: AssistantRole;
  fieldState: Record<string, FieldUpdate>;
  onFieldClick?: (fieldKey: string) => void;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'complete':
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
          <Check size={12} className="text-green-600" strokeWidth={3} />
        </div>
      );
    case 'ai_suggested':
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100">
          <Sparkles size={11} className="text-indigo-600" />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-200">
          <Circle size={8} className="text-gray-300" />
        </div>
      );
  }
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  role,
  fieldState,
  onFieldClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { required, optional } = getFieldsForRole(role);
  const { completed, total } = countCompleted(fieldState, required);
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="border-b border-gray-100 bg-gray-50/50">
      {/* Collapsed bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-500">
            {completed} of {total} required
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded grid */}
      {isExpanded && (
        <div className="px-4 pb-3 animate-in slide-in-from-top-1 duration-200">
          {/* Required fields */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-1">
            Required
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
            {required.map((field) => {
              const state = fieldState[field.key];
              return (
                <button
                  key={field.key}
                  onClick={() => onFieldClick?.(field.key)}
                  className="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-100 transition-colors text-left"
                >
                  <StatusIcon status={state?.status ?? 'empty'} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-700 truncate">{field.label}</p>
                    {state?.value && state.status !== 'empty' && (
                      <p className="text-[10px] text-gray-400 truncate">{state.value}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional fields */}
          {optional.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Optional
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {optional.map((field) => {
                  const state = fieldState[field.key];
                  return (
                    <button
                      key={field.key}
                      onClick={() => onFieldClick?.(field.key)}
                      className="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-100 transition-colors text-left"
                    >
                      <StatusIcon status={state?.status ?? 'empty'} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 truncate">{field.label}</p>
                        {state?.value && state.status !== 'empty' && (
                          <p className="text-[10px] text-gray-400 truncate">{state.value}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
