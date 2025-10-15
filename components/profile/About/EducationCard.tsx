'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { EducationEntry } from './types';

interface ProfileAboutEducationCardProps {
  education: EducationEntry;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  onSetMain: () => void;
}

export function ProfileAboutEducationCard({
  education,
  index,
  onEdit,
  onRemove,
  onSetMain,
}: ProfileAboutEducationCardProps) {
  const [hover, setHover] = useState(false);

  if (!education.summary && !education.name) {
    return null;
  }

  return (
    <div
      className="relative border border-gray-200 rounded-md p-3 pr-12 bg-white hover:border-gray-300 transition-all cursor-pointer"
      onClick={onEdit}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex justify-between items-start">
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

        <div className="absolute right-3 top-3 flex items-center space-x-2">
          {/* Main checkbox */}
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center 
              ${education.is_public ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
            onClick={(e) => {
              e.stopPropagation();
              onSetMain();
            }}
            title="Set as main education"
          >
            {education.is_public && (
              <FontAwesomeIcon icon={faCheck} className="text-blue-500 text-xs" />
            )}
          </div>

          {/* Remove button */}
          <button
            className={`text-gray-400 hover:text-red-500 transition-colors ${hover ? 'opacity-100' : 'opacity-0'}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title="Remove education"
          >
            <FontAwesomeIcon icon={faTrash} className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
