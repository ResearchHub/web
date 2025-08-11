'use client';

import { Checkbox } from '@/components/ui/form/Checkbox';
import { ReactNode } from 'react';

interface DeclarationCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: ReactNode;
  error?: string | null;
}

export function DeclarationCheckbox({
  id,
  checked,
  onChange,
  label,
  description,
  error,
}: DeclarationCheckboxProps) {
  return (
    <div className="space-y-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} label={label} />
      {description && <div className="pl-6 text-sm text-gray-500">{description}</div>}
      {error && <div className="pl-6 text-sm text-red-600">{error}</div>}
    </div>
  );
}
