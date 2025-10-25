'use client';

import { useState } from 'react';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';

// Comprehensive list of degrees from the old codebase
export const degreeOptions = [
  { value: 'HSD', label: 'Highschool Diploma' },
  { value: 'AA', label: "Associate's Degree" },
  { value: 'AA', label: 'Associate of Arts' },
  { value: 'AS', label: 'Asscoiate of Science' },
  { value: 'AAS', label: 'Associate of Arts and Science' },
  { value: 'BA', label: "Bachelor's Degree" },
  { value: "Engineer's Degree", label: "Engineer's Degree" },
  { value: 'Foundation Degree', label: 'Foundation Degree' },
  { value: 'Licentiate Degree', label: 'Licentiate Degree' },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: 'BASc', label: 'Bachelor of Applied Science' },
  { value: 'BArch', label: 'Bachelor of Architecture' },
  { value: 'BA', label: 'Bachelor of Arts' },
  { value: 'BBA', label: 'Bachelor of Business Administration' },
  { value: 'BCom', label: 'Bachelor of Commerce' },
  { value: 'BEd', label: 'Bachelor of Education' },
  { value: 'BE', label: 'Bachelor of Engineering' },
  { value: 'BFA', label: 'Bachelor of Fine Arts' },
  { value: 'LLB', label: 'Bachelor of Laws' },
  { value: 'MBBS', label: 'Bachelor of Medicine, Bachelor of Surgery' },
  { value: 'BPharm', label: 'Bachelor of Pharmacy' },
  { value: 'BS', label: 'Bachelor of Science' },
  { value: 'BTech', label: 'Bachelor of Technology - BTech' },
  { value: 'BVSc', label: 'Bachelor of Veterinary Science' },
  { value: 'MArch', label: 'Master of Architecture' },
  { value: 'MA', label: 'Master of Arts' },
  { value: 'MBA', label: 'Master of Business Administration' },
  { value: 'MCA', label: 'Master of Computer Applications' },
  { value: 'MDiv', label: 'Master of Divinity' },
  { value: 'MEd', label: 'Master of Education' },
  { value: 'MEng', label: 'Master of Engineering' },
  { value: 'MFA', label: 'Master of Fine Arts' },
  { value: 'LLM', label: 'Master of Laws' },
  { value: 'MLIS', label: 'Master of Library & Information Science' },
  { value: 'MPhil', label: 'Master of Philosophy' },
  { value: 'MPA', label: 'Master of Public Administration' },
  { value: 'MPH', label: 'Master of Public Health' },
  { value: 'MS', label: 'Master of Science' },
  { value: 'MSW', label: 'Master of Social Work' },
  { value: 'MTech', label: 'Master of Technology' },
  { value: 'EdD', label: 'Doctor of Education' },
  { value: 'JD', label: 'Doctor of Law' },
  { value: 'MD', label: 'Doctor of Medicine' },
  { value: 'PharmD', label: 'Doctor of Pharmacy' },
  { value: 'PhD', label: 'Doctor of Philosophy' },
  { value: 'DVM', label: 'Doctor of Veterinary Medicine' },
];

// Add some common simplified degree categories at the top for ease of use
export const popularDegreeOptions = [
  { value: "Bachelor's", label: "Bachelor's" },
  { value: "Master's", label: "Master's" },
  { value: 'PhD', label: 'PhD' },
  { value: 'MD', label: 'MD' },
  { value: 'JD', label: 'JD' },
  { value: 'MBA', label: 'MBA' },
  { value: "Associate's", label: "Associate's" },
  { value: 'High School', label: 'High School' },
];

// Combine both arrays, with popular ones first and removing duplicates
export const combinedDegreeOptions = [
  ...popularDegreeOptions,
  ...degreeOptions.filter(
    (option) => !popularDegreeOptions.some((pop) => pop.value === option.value)
  ),
];

export interface DegreeOption {
  value: string;
  label: string;
}

interface DegreeDropdownProps {
  value: DegreeOption | undefined;
  onChange: (degree: DegreeOption | undefined) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function DegreeDropdown({
  value,
  onChange,
  label = 'Degree',
  required = false,
  className,
}: DegreeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      label={label}
      required={required}
      trigger={
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-left focus:outline-none focus:ring-primary-500 focus:border-primary-500',
            !value && 'text-gray-500',
            className
          )}
        >
          {value ? value.label : 'Select Degree'}
          <ChevronDown
            className={cn('ml-2 h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          />
        </button>
      }
      className="max-h-60 overflow-y-auto py-1"
      onOpenChange={setIsOpen}
    >
      <div className="py-1 max-h-60 overflow-y-auto">
        <DropdownItem
          onClick={() => onChange(undefined)}
          className={!value ? 'bg-gray-100 font-medium' : ''}
        >
          No degree
        </DropdownItem>

        {/* Show a divider between sections */}
        <div className="py-1">
          <div className="px-2 text-xs font-semibold text-gray-500 uppercase">Popular</div>
        </div>

        {/* Popular degree options */}
        {popularDegreeOptions.map((option) => (
          <DropdownItem
            key={`popular-${option.value}`}
            onClick={() => onChange(option)}
            className={value?.value === option.value ? 'bg-gray-100 font-medium' : ''}
          >
            {option.label}
          </DropdownItem>
        ))}

        {/* Show a divider between sections */}
        <div className="py-1">
          <div className="px-2 text-xs font-semibold text-gray-500 uppercase">All Degrees</div>
        </div>

        {/* All degree options */}
        {degreeOptions.map((option) => (
          <DropdownItem
            key={option.value}
            onClick={() => onChange(option)}
            className={value?.value === option.value ? 'bg-gray-100 font-medium' : ''}
          >
            {option.label}
          </DropdownItem>
        ))}
      </div>
    </Dropdown>
  );
}
