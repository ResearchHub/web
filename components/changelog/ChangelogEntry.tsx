'use client';

import { Work } from '@/types/work';
import { format } from 'date-fns';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';

interface ChangelogEntryProps {
  work: Work;
  content?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy');
};

export const ChangelogEntry: React.FC<ChangelogEntryProps> = ({ work, content }) => {
  const formattedDate = formatDate(work.createdDate);

  const renderContent = () => {
    if (work.previewContent) {
      return <PostBlockEditor content={work.previewContent} editable={false} />;
    }
    if (content) {
      return (
        <div
          className="prose prose-lg max-w-none text-gray-700 bg-white rounded-lg shadow-sm border p-6 mb-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return <p className="text-gray-500">No content available</p>;
  };

  return (
    <article className="mb-16 pt-16 border-t border-gray-200 first:border-t-0 first:pt-0">
      {/* Mobile: Date above content */}
      <div className="tablet:!hidden mb-4">
        <div className="text-sm text-gray-500 font-medium">{formattedDate}</div>
      </div>

      <div className="flex gap-8">
        {/* Desktop: Left column - Date (sticky) */}
        <div className="hidden tablet:!block flex-shrink-0 w-32">
          <div className="sticky top-8 text-sm text-gray-500 font-medium">{formattedDate}</div>
        </div>

        {/* Content */}
        <div className="flex-1">{renderContent()}</div>
      </div>
    </article>
  );
};
