'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import type { EducationEntry } from './OnboardingWizard'; // Adjust path if needed

interface OnboardingEducationCardProps {
  education: EducationEntry;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  onSetMain: () => void;
}

export function OnboardingEducationCard({
  education,
  index,
  onEdit,
  onRemove,
  onSetMain,
}: OnboardingEducationCardProps) {
  if (!education.summary && !education.name) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-white hover:border-gray-300 transition-all">
      <div className="cursor-pointer" onClick={onEdit}>
        <div>
          {education.summary ? (
            <div className="font-medium text-gray-800">{education.summary}</div>
          ) : (
            <div className="font-medium text-gray-800">
              {education.degree?.label} {education.major && `in ${education.major}`}
              {education.year?.value && ` '${education.year.value.slice(2)}'`}
              {education.name && `, ${education.name}`}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {education.is_public ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Primary
          </span>
        ) : (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSetMain();
            }}
            className="text-xs text-gray-600 hover:text-blue-600 p-0 h-auto"
          >
            Set as primary
          </Button>
        )}

        <span className="text-gray-300">•</span>

        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-xs text-gray-600 hover:text-red-600 p-0 h-auto"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
