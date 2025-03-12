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
    <div>
      <div className="mb-3">
        <div className="text-md font-semibold text-gray-900">Bounty Details</div>
      </div>
      <div className="text-gray-600">
        <CommentReadOnly content={content} contentFormat={contentFormat} />
      </div>
    </div>
  );
};
