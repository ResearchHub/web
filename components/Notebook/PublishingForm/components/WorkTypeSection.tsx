import { type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { FileText, ChevronDown } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { cn } from '@/utils/styles';
import { SectionHeader } from './SectionHeader';
import { PublishingFormData } from '../schema';
import { Button } from '@/components/ui/Button';
import { useNotebookContext } from '@/contexts/NotebookContext';
import Icon from '@/components/ui/icons/Icon';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { NoteService } from '@/services/note.service';

const ARTICLE_TYPE_TO_DOCUMENT_TYPE: Record<PublishingFormData['articleType'], string> = {
  discussion: 'DISCUSSION',
  preregistration: 'PREREGISTRATION',
  grant: 'GRANT',
};

const articleTypes: Record<
  PublishingFormData['articleType'],
  { title: string; description: string; icon: ReactNode; selectedIcon: ReactNode }
> = {
  preregistration: {
    title: 'Proposal',
    description: 'Crowdfund your research',
    icon: <FundingIcon size={16} color="#2563eb" />,
    selectedIcon: <FundingIcon size={16} color="#6b7280" />,
  },
  grant: {
    title: 'Funding Opportunity',
    description: 'Fund specific research you care about',
    icon: <Icon name="fund" size={16} color="#2563eb" />,
    selectedIcon: <Icon name="fund" size={16} color="#6b7280" />,
  },
  discussion: {
    title: 'Preprint',
    description: 'Publish your research as a preprint',
    icon: <Icon name="submit1" size={16} color="#2563eb" />,
    selectedIcon: <Icon name="submit1" size={16} color="#6b7280" />,
  },
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
  const currentType = articleType ? articleTypes[articleType] : null;

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
                {currentType?.selectedIcon ?? <Icon name="submit1" size={16} color="#6b7280" />}
                <span>{currentType?.title ?? 'Select work type'}</span>
              </div>
              <ChevronDown className="h-4 w-4 ml-auto" />
            </Button>
          }
          align="start"
          className="w-[340px] p-2"
        >
          <div className="space-y-4 pt-2">
            <div>
              <div className="px-3 mb-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Type
                </h3>
              </div>
              <div className="space-y-2">
                {Object.entries(articleTypes).map(([type, info]) => (
                  <BaseMenuItem
                    key={type}
                    onClick={() => {
                      const newType = type as PublishingFormData['articleType'];
                      setValue('articleType', newType);
                      if (note && !note.post) {
                        NoteService.updateNote({
                          noteId: note.id,
                          document_type: ARTICLE_TYPE_TO_DOCUMENT_TYPE[newType],
                        });
                      }
                    }}
                    className={cn('w-full px-2', articleType === type ? 'bg-gray-100' : '')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                          {info.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-medium tracking-[0.02em] text-gray-900">
                          {info.title}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">{info.description}</div>
                      </div>
                    </div>
                  </BaseMenuItem>
                ))}
              </div>
            </div>
          </div>
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
