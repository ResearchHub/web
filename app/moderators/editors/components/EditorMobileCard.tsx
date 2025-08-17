import { cn } from '@/utils/styles';
import { TransformedEditorData } from '@/types/editor';
import { formatDistanceToNow } from 'date-fns';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export interface EditorMobileCardProps {
  editor: TransformedEditorData;
  onEdit: () => void;
  onDelete: () => void;
  hasWriteAccess: boolean;
  className?: string;
}

export function EditorMobileCard({
  editor,
  onEdit,
  onDelete,
  hasWriteAccess,
  className,
}: EditorMobileCardProps) {
  const formatDate = (date?: Date) => {
    if (!date) return 'never';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4 space-y-3', className)}>
      {/* User Section */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Avatar
                src={editor.authorProfile.profileImage || ''}
                alt={`${editor.authorProfile.firstName} ${editor.authorProfile.lastName}`}
                size="sm"
                authorId={editor.authorProfile.id}
                disableTooltip={true}
                className="flex-shrink-0"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {editor.authorProfile.firstName} {editor.authorProfile.lastName}
              </h3>
              {editor.editorAddedDate && (
                <p className="text-xs text-gray-500">Added {formatDate(editor.editorAddedDate)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        {hasWriteAccess && (
          <div className="flex-shrink-0">
            <Dropdown
              anchor="bottom end"
              trigger={
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
              className="w-40"
            >
              {onEdit && (
                <DropdownItem
                  onClick={onEdit}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                  Edit Editor
                </DropdownItem>
              )}
              {onDelete && (
                <DropdownItem
                  onClick={onDelete}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Editor
                </DropdownItem>
              )}
            </Dropdown>
          </div>
        )}
      </div>

      {/* Hub Tags */}
      {editor.authorProfile.editorOfHubs && editor.authorProfile.editorOfHubs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {editor.authorProfile.editorOfHubs.map((hub, hubIndex) => (
            <span
              key={`${hub.id}-${hubIndex}`}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {hub.name}
            </span>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{editor.submissionCount}</div>
          <div className="text-xs text-gray-500">Submissions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{editor.supportCount}</div>
          <div className="text-xs text-gray-500">Tips</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{editor.commentCount}</div>
          <div className="text-xs text-gray-500">Comments</div>
        </div>
      </div>

      {/* Activity Dates */}
      <div className="pt-2 border-t border-gray-100 space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Last Submission:</span>
          <span>{formatDate(editor.latestSubmissionDate)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Last Comment:</span>
          <span>{formatDate(editor.latestCommentDate)}</span>
        </div>
      </div>

      {/* Active Hub Contributors */}
      {editor.activeHubContributorCount !== null && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Active Hub Contributors:</span>
            <span className="font-medium text-gray-900">{editor.activeHubContributorCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
