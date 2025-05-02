'use client';

import React, { useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { EducationAutocomplete, University } from './EducationAutocomplete';
import { YearDropdown, YearOption } from './YearDropdown';
import type { EducationEntry } from './OnboardingWizard'; // Adjust path if needed

interface OnboardingEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  education: EducationEntry;
  onSave: (education: EducationEntry) => void;
  setAsMain: () => void;
}

const degreeOptions = [
  {
    value: 'HSD',
    label: 'Highschool Diploma',
  },
  {
    value: 'AA',
    label: "Associate's Degree",
  },
  {
    value: 'AA',
    label: 'Associate of Arts',
  },
  {
    value: 'AS',
    label: 'Associate of Science',
  },
  {
    value: 'AAS',
    label: 'Associate of Arts and Science',
  },
  {
    value: 'BA',
    label: "Bachelor's Degree",
  },
  {
    value: "Engineer's Degree",
    label: "Engineer's Degree",
  },
  {
    value: 'Foundation Degree',
    label: 'Foundation Degree',
  },
  {
    value: 'Licentiate Degree',
    label: 'Licentiate Degree',
  },
  {
    value: "Master's Degree",
    label: "Master's Degree",
  },
  {
    value: 'BASc',
    label: 'Bachelor of Applied Science',
  },
  {
    value: 'BArch',
    label: 'Bachelor of Architecture',
  },
  {
    value: 'BA',
    label: 'Bachelor of Arts',
  },
  {
    value: 'BBA',
    label: 'Bachelor of Business Administration',
  },
  {
    value: 'BCom',
    label: 'Bachelor of Commerce',
  },
  {
    value: 'BEd',
    label: 'Bachelor of Education',
  },
  {
    value: 'BE',
    label: 'Bachelor of Engineering',
  },
  {
    value: 'BFA',
    label: 'Bachelor of Fine Arts',
  },
  {
    value: 'LLB',
    label: 'Bachelor of Laws',
  },
  {
    value: 'MBBS',
    label: 'Bachelor of Medicine, Bachelor of Surgery',
  },
  {
    value: 'BPharm',
    label: 'Bachelor of Pharmacy',
  },
  {
    value: 'BS',
    label: 'Bachelor of Science',
  },
  {
    value: 'BTech',
    label: 'Bachelor of Technology - BTech',
  },
  {
    value: 'BVSc',
    label: 'Bachelor of Veterinary Science',
  },
  {
    value: 'MArch',
    label: 'Master of Architecture',
  },
  {
    value: 'MA',
    label: 'Master of Arts',
  },
  {
    value: 'MBA',
    label: 'Master of Business Administration',
  },
  {
    value: 'MCA',
    label: 'Master of Computer Applications',
  },
  {
    value: 'MDiv',
    label: 'Master of Divinity',
  },
  {
    value: 'MEd',
    label: 'Master of Education',
  },
  {
    value: 'MEng',
    label: 'Master of Engineering',
  },
  {
    value: 'MFA',
    label: 'Master of Fine Arts',
  },
  {
    value: 'LLM',
    label: 'Master of Laws',
  },
  {
    value: 'MLIS',
    label: 'Master of Library & Information Science',
  },
  {
    value: 'MPhil',
    label: 'Master of Philosophy',
  },
  {
    value: 'MPA',
    label: 'Master of Public Administration',
  },
  {
    value: 'MPH',
    label: 'Master of Public Health',
  },
  {
    value: 'MS',
    label: 'Master of Science',
  },
  {
    value: 'MSW',
    label: 'Master of Social Work',
  },
  {
    value: 'MTech',
    label: 'Master of Technology',
  },
  {
    value: 'EdD',
    label: 'Doctor of Education',
  },
  {
    value: 'JD',
    label: 'Doctor of Law',
  },
  {
    value: 'MD',
    label: 'Doctor of Medicine',
  },
  {
    value: 'PharmD',
    label: 'Doctor of Pharmacy',
  },
  {
    value: 'PhD',
    label: 'Doctor of Philosophy',
  },
  {
    value: 'DVM',
    label: 'Doctor of Veterinary Medicine',
  },
  {
    value: 'Other',
    label: 'Other',
  },
];

export function OnboardingEducationModal({
  isOpen,
  onClose,
  education,
  onSave,
  setAsMain,
}: OnboardingEducationModalProps) {
  // Convert education.name to a University object if it exists
  const initialUniversity = education.name
    ? {
        id: education.id || `temp-${Date.now()}`,
        name: education.name,
      }
    : null;

  const [university, setUniversity] = useState<University | null>(initialUniversity);
  const [degree, setDegree] = useState<{ value: string; label: string } | undefined>(
    education.degree || undefined
  );
  const [year, setYear] = useState<YearOption | undefined>(education.year || undefined);
  const [major, setMajor] = useState(education.major || '');
  const [isPublic, setIsPublic] = useState(education.is_public || false);

  useEffect(() => {
    if (isOpen) {
      // Convert education.name to a University object if it exists
      const newUniversity = education.name
        ? {
            id: education.id || `temp-${Date.now()}`,
            name: education.name,
          }
        : null;

      setUniversity(newUniversity);
      setDegree(education.degree || undefined);
      setYear(education.year || undefined);
      setMajor(education.major || '');
      setIsPublic(education.is_public || false);
    }
  }, [isOpen, education]);

  // Fix the onChange handlers for the select elements
  const handleDegreeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setDegree(undefined);
    } else {
      const selectedOption = degreeOptions.find((opt) => opt.value === value);
      setDegree(selectedOption);
    }
  };

  const handleSave = () => {
    if (!university) return;

    // Create summary string
    let summary = '';

    if (major) {
      summary += major + ' ';
    }

    if (degree) {
      summary += degree.value + (year ? '' : ',');
    }

    if (year) {
      let formattedYear = " '" + year.value.slice(2) + ',';
      summary += formattedYear;
    }

    summary += ' ' + university.name;

    const educationEntry: EducationEntry = {
      id: university.id, // No need to check for 'new-' prefix since we don't allow custom entries
      name: university.name,
      university: university, // Store the full university object
      degree,
      year,
      major,
      is_public: isPublic,
      summary: summary,
    };

    onSave(educationEntry);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Add Education">
      <div className="p-4">
        <div className="space-y-4">
          <EducationAutocomplete
            label="School"
            required
            value={university}
            onChange={setUniversity}
            placeholder="Search for a university..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Field of Study"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={degree?.value || ''}
              onChange={handleDegreeChange}
            >
              <option value="">Select Degree</option>
              {degreeOptions.map((option, index) => (
                <option key={option.value + index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <YearDropdown value={year} onChange={setYear} required />
          </div>

          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="setAsMain"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="setAsMain" className="ml-2 block text-sm text-gray-700">
              Set as Main
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!university}>
            Save
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
