'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '@fortawesome/pro-light-svg-icons';
import { Button } from '@/components/ui/Button';
import { Education } from '@/types/authorProfile';

interface ProfileEducationProps {
  educations: Education[];
}

export function ProfileEducation({ educations }: ProfileEducationProps) {
  const [showAll, setShowAll] = useState(false);

  if (educations.length === 0) return null;

  const primaryIndex = educations.findIndex((e) => e.is_public);
  const primaryEducation = primaryIndex !== -1 ? educations[primaryIndex] : undefined;
  const otherEducations = educations.filter((_, idx) => idx !== primaryIndex);
  const allOrdered = [primaryEducation, ...otherEducations].filter(Boolean);
  const displayed = showAll ? allOrdered : allOrdered.slice(0, 2);
  const remainingCount = allOrdered.length - displayed.length;

  return (
    <div className="flex items-baseline gap-2 text-gray-600">
      <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 self-start text-[#6B7280]" />
      <span className="inline">
        {displayed
          .filter((edu) => edu !== undefined)
          .map((edu, idx) => (
            <span key={`edu-${edu.id}-${idx}`}>
              {edu.summary
                ? edu.summary
                : `${edu.degree?.label || ''}${edu.major ? ` in ${edu.major}` : ''}${edu.year?.value ? ` '${edu.year.value.slice(2)}` : ''}${edu.name ? `, ${edu.name}` : ''}`}
              {idx < displayed.length - 1 && ', '}
            </span>
          ))}
        {(remainingCount > 0 || showAll) && (
          <Button
            variant="link"
            size="sm"
            className="ml-1 p-0 h-auto align-baseline text-base"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show less' : `+${remainingCount} more`}
          </Button>
        )}
      </span>
    </div>
  );
}
