import { useFormContext } from 'react-hook-form';
import { FileText, ChevronDown, Wallet, ExternalLink } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { cn } from '@/utils/styles';
import { SectionHeader } from './SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';
import Link from 'next/link';
import { Tooltip } from '@/components/ui/Tooltip';

export type ArticleType = 'research' | 'preregistration' | 'other';

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
  const { note } = useNotebookPublish();

  const isPublished = Boolean(note?.post);

  return (
    <div className="py-3 px-6">
      <div className="flex items-start justify-start gap-2">
        <SectionHeader icon={FileText}>Work Type</SectionHeader>
        {!note ? (
          <div className="h-5 w-14 bg-gray-100 animate-pulse rounded-full" />
        ) : isPublished ? (
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              Published
            </Badge>
            {articleType === 'preregistration' && (
              <Tooltip content="View funding page">
                <Link
                  href={`/fund/${note.post?.id}/${note.post?.slug}`}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Tooltip>
            )}
          </div>
        ) : (
          <Badge variant="default" size="sm">
            Draft
          </Badge>
        )}
      </div>
      <div className="mt-2">
        <BaseMenu
          disabled={isPublished}
          sameWidth
          trigger={
            <button
              className={cn(
                'border w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg',
                note?.post && 'opacity-50 cursor-not-allowed hover:bg-white'
              )}
            >
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
