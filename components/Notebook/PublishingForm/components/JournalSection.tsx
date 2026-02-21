import { useFormContext } from 'react-hook-form';
import { BookOpen, Check } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { SectionHeader } from './SectionHeader';

export function JournalSection() {
  const { watch, setValue } = useFormContext();
  const isJournalEnabled = watch('isJournalEnabled');

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={BookOpen}>ResearchHub Journal</SectionHeader>
      <div className="mt-2">
        <div className="p-3 bg-gradient-to-b from-indigo-50/80 to-white rounded-lg border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Price:</span>
                <span className="text-xs font-medium text-indigo-600">$1,000 USD</span>
              </div>
            </div>
            <Switch
              checked={isJournalEnabled}
              onCheckedChange={(checked) => setValue('isJournalEnabled', checked)}
            />
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Check
                className="h-[18px] w-[18px] mt-0.5 text-indigo-600 flex-shrink-0"
                strokeWidth={2}
              />
              <span className="text-sm text-gray-600">
                Accredited journal publication with low APCs
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check
                className="h-[18px] w-[18px] mt-0.5 text-indigo-600 flex-shrink-0"
                strokeWidth={2}
              />
              <span className="text-sm text-gray-600">Rapid decision (21 days)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check
                className="h-[18px] w-[18px] mt-0.5 text-indigo-600 flex-shrink-0"
                strokeWidth={2}
              />
              <span className="text-sm text-gray-600">3x paid Peer Reviews</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
