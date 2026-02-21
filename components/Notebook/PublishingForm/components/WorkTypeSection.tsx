import { useFormContext } from 'react-hook-form';
import { FileText, ChevronDown, Wallet } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { cn } from '@/utils/styles';
import { SectionHeader } from './SectionHeader';
import { PublishingFormData } from '../schema';
import { Button } from '@/components/ui/Button';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { Icon } from '@/components/ui/icons/Icon';

const articleTypes: Record<
  PublishingFormData['articleType'],
  { title: string; description: string }
> = {
  discussion: {
    title: 'Original Research Work',
    description: 'Publish your original research',
  },
  preregistration: {
    title: 'Proposal',
    description: 'Get funding by sharing your research plan',
  },
  grant: {
    title: 'RFP',
    description: 'Create a request for proposals',
  },
};

const renderSelectedIcon = (articleType: PublishingFormData['articleType'] | undefined) => {
  if (articleType === 'discussion') {
    return <FileText className="h-4 w-4 text-gray-500" />;
  }
  if (articleType === 'preregistration') {
    return <Wallet className="h-4 w-4 text-gray-500" />;
  }
  if (articleType === 'grant') {
    return <Icon name="fund" size={16} className="text-gray-500" />;
  }
  return <FileText className="h-4 w-4 text-gray-500" />;
};

export function WorkTypeSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PublishingFormData>();
  const articleType = watch('articleType');
  const workId = watch('workId');
  const { currentNote: note } = useNotebookContext();

  const isPublished = Boolean(workId);

  return (
    <div className="py-3 px-6">
      <div className="flex items-start gap-2">
        <SectionHeader icon={FileText}>Work Type</SectionHeader>
      </div>
      <div>
        <BaseMenu
          disabled={isPublished}
          sameWidth
          trigger={
            <Button
              variant="outlined"
              className={cn(
                'w-full justify-start',
                note?.post && 'opacity-50 cursor-not-allowed hover:bg-white',
                errors.articleType && 'border-red-500'
              )}
              disabled={isPublished}
            >
              <div className="flex items-center gap-2">
                {renderSelectedIcon(articleType)}
                <span>
                  {articleType && articleTypes[articleType]
                    ? articleTypes[articleType].title
                    : 'Select work type'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 ml-auto" />
            </Button>
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
              onClick={() => setValue('articleType', type as PublishingFormData['articleType'])}
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
        {errors.articleType && (
          <div className="mt-1.5 text-sm text-red-500">
            {errors.articleType.message?.toString()}
          </div>
        )}
      </div>
    </div>
  );
}
