import type { University } from './EducationAutocomplete';

export interface YearOption {
  value: string;
  label: string;
}

export interface DegreeOption {
  value: string;
  label: string;
}

export interface EducationEntry {
  id?: string | number;
  name?: string;
  university?: University;
  degree?: DegreeOption;
  year?: YearOption;
  major?: string;
  is_public?: boolean;
  summary?: string;
}
