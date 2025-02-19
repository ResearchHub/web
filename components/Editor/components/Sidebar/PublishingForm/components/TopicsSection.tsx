import { useFormContext } from 'react-hook-form';
import { Tag, Plus, Hash } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

export function TopicsSection() {
  const { register, watch, setValue } = useFormContext();
  const topics = watch('topics');

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Tag}>Topics</SectionHeader>
      <div className="mt-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Plus className="h-4 w-4 text-gray-400" />
          Add topics to your work
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {/* Example topics - these should be dynamic */}
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
            <Hash className="h-3 w-3" />
            <span>Biochemistry</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
            <Hash className="h-3 w-3" />
            <span>Cell Biology</span>
          </div>
        </div>
      </div>
    </div>
  );
}
