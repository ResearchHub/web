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
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-gray-600" />
        <div className="text-sm font-semibold text-gray-600">Details</div>
      </div>
      <div className="mt-2">
        <CommentReadOnly content={content} contentFormat={contentFormat} />
      </div>
    </div>
  );
};
