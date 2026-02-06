'use client';

import React from 'react';
import type { AssistantRole, FieldUpdate } from '@/types/assistant';
import { getFieldsForRole, countCompleted } from './lib/fieldDefinitions';
import { Checkbox } from '@/components/ui/form/Checkbox';

interface AssistantProgressProps {
  role: AssistantRole;
  fieldState: Record<string, FieldUpdate>;
  onFieldClick?: (fieldKey: string) => void;
}

function isFieldDone(status?: string): boolean {
  return status === 'complete';
}

export const AssistantProgress: React.FC<AssistantProgressProps> = ({
  role,
  fieldState,
  onFieldClick,
}) => {
  const { required, optional } = getFieldsForRole(role);
  const { completed, total } = countCompleted(fieldState, required);
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="py-4">
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Progress</h3>
          <span className="text-xs font-medium text-gray-500">
            {completed}/{total}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="px-4 mb-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Required
        </p>
        <div className="space-y-0.5">
          {required.map((field) => {
            const state = fieldState[field.key];
            const done = isFieldDone(state?.status);
            return (
              <button
                key={field.key}
                onClick={() => onFieldClick?.(field.key)}
                className="flex items-center gap-3 w-full py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Checkbox checked={done} readOnly className="pointer-events-none" />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm truncate ${done ? 'text-gray-400 line-through' : 'font-medium text-gray-800'}`}
                  >
                    {field.label}
                  </p>
                  {state?.value && state.status !== 'empty' && (
                    <p className="text-[11px] text-gray-400 truncate">{state.value}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {optional.length > 0 && (
        <div className="px-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Optional
          </p>
          <div className="space-y-0.5">
            {optional.map((field) => {
              const state = fieldState[field.key];
              const done = isFieldDone(state?.status);
              return (
                <button
                  key={field.key}
                  onClick={() => onFieldClick?.(field.key)}
                  className="flex items-center gap-3 w-full py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Checkbox checked={done} readOnly className="pointer-events-none" />
                  <p
                    className={`text-sm truncate min-w-0 flex-1 ${done ? 'text-gray-400 line-through' : 'text-gray-500'}`}
                  >
                    {field.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
