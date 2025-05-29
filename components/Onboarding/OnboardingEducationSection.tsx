'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/pro-light-svg-icons';
import { Button } from '@/components/ui/Button';
import { OnboardingEducationCard } from './OnboardingEducationCard'; // Update import name and path
import type { EducationEntry } from './OnboardingWizard'; // Adjust path if needed

interface OnboardingEducationSectionProps {
  // Rename interface
  education: EducationEntry[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onSetMain: (index: number) => void;
}

export function OnboardingEducationSection({
  // Rename function
  education,
  onAdd,
  onEdit,
  onRemove,
  onSetMain,
}: OnboardingEducationSectionProps) {
  // Update interface usage
  return (
    <div className="space-y-2">
      {education.length > 0 && (
        <div className="space-y-2">
          {education.map((edu, index) => (
            <OnboardingEducationCard
              key={`edu-${index}`}
              education={edu}
              index={index}
              onEdit={() => onEdit(index)}
              onRemove={() => onRemove(index)}
              onSetMain={() => onSetMain(index)}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outlined"
        size="sm"
        onClick={onAdd}
        className="text-blue-600 border-blue-300 hover:bg-blue-50"
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        Add Education
      </Button>
    </div>
  );
}
