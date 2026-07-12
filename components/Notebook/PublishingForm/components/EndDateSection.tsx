import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';

const END_DATE_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
] as const;

export function EndDateSection() {
  const { watch, setValue } = useFormContext();
  const fundraiseEndDays = watch('fundraiseEndDays') ?? '90';

  return (
    <div>
      <h3 className="text-[15px] font-semibold tracking-tight text-gray-900 mb-2">
        Fundraise Duration
      </h3>
      <div className="relative">
        <select
          value={fundraiseEndDays}
          onChange={(e) =>
            setValue('fundraiseEndDays', e.target.value as '30' | '60' | '90', {
              shouldDirty: true,
            })
          }
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-9 cursor-pointer"
        >
          {END_DATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Your proposal will stop accepting contributions after this period.
      </p>
    </div>
  );
}
