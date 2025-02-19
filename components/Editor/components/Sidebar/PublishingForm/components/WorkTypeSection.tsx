import { useFormContext } from 'react-hook-form';
import { FileText, ChevronDown, Wallet } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { cn } from '@/utils/styles';
import { SectionHeader } from './SectionHeader';
import { ArticleType } from '@/contexts/NotebookPublishContext';

const articleTypes: Record<ArticleType, { title: string; description: string }> = {
  research: {
    title: 'Original Research Work',
    description: 'Submit your original research',
  },
  preregistration: {
    title: 'Preregistration',
    description: 'Get funding by sharing your research plan',
  },
  other: {
    title: 'Other',
    description: 'Literature review, hypothesis, question, etc.',
  },
};

const renderSelectedIcon = (articleType: ArticleType) => {
  if (articleType === 'research') {
    return <FileText className="h-4 w-4 text-gray-500" />;
  }
  if (articleType === 'preregistration') {
    return <Wallet className="h-4 w-4 text-gray-500" />;
  }
  return <FileText className="h-4 w-4 text-gray-500" />;
};

export function WorkTypeSection() {
  const { watch, setValue } = useFormContext();
  const articleType = watch('articleType') as ArticleType;

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={FileText}>Work Type</SectionHeader>
      <div className="mt-2">
        <BaseMenu
          trigger={
            <button className="border w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2">
                {renderSelectedIcon(articleType)}
                <span>{articleTypes[articleType].title}</span>
              </div>
              <ChevronDown className="h-4 w-4 ml-auto" />
            </button>
          }
          align="start"
          className="w-[300px]"
        >
          <div className="text-[.65rem] font-semibold mb-1 uppercase text-neutral-500 px-2">
            Work Type
          </div>
          {Object.entries(articleTypes).map(([type, info]) => (
            <BaseMenuItem
              key={type}
              onClick={() => setValue('articleType', type as ArticleType)}
              className={cn(
                'flex flex-col items-start py-3',
                articleType === type ? 'bg-gray-100' : ''
              )}
            >
              <div className="font-medium text-gray-900">{info.title}</div>
              <div className="text-sm text-gray-500 mt-0.5">{info.description}</div>
            </BaseMenuItem>
          ))}
        </BaseMenu>
      </div>
    </div>
  );
}
