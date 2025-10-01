'use client';

import { Field, Label, Switch } from '@headlessui/react';

interface FilterSwitchProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly className?: string;
}

export function FilterSwitch({
  label,
  checked,
  onChange,
  className = 'pt-2 pb-2 border-b border-gray-200',
}: FilterSwitchProps) {
  return (
    <Field className={`${className} flex items-center justify-between`}>
      <Label>{label}</Label>
      <Switch
        checked={checked}
        onChange={onChange}
        className={`group inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`size-4 translate-x-1 rounded-full bg-white transition ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </Switch>
    </Field>
  );
}
