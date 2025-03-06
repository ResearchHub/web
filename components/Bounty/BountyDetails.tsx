import { Info } from 'lucide-react';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { ContentFormat } from '@/types/comment';

interface BountyDetailsProps {
  content: any;
  contentFormat: ContentFormat | undefined;
}

export const BountyDetails = ({ content, contentFormat }: BountyDetailsProps) => {
  if (!content || Object.keys(content).length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50/70 p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-gray-600" />
        <div className="text-sm font-semibold text-gray-700">Details</div>
      </div>
      <div className="mt-3">
        <CommentReadOnly content={content} contentFormat={contentFormat} />
      </div>
    </div>
  );
};
