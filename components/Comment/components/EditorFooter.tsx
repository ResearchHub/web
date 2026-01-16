import { Button } from '@/components/ui/Button';
import { useIsMobile } from '@/hooks/useIsMobile';

interface EditorFooterProps {
  saveStatus: 'idle' | 'saving' | 'saved';
  lastSaved: Date | null;
  formatLastSaved: () => string;
  onCancel?: () => void;
  onReset?: () => void;
  onSubmit: () => void;
  clearDraft: () => void;
  isSubmitting: boolean;
  hideSubmit?: boolean;
  isMac?: boolean;
  canSubmit?: boolean;
  wordCount?: number;
  wordLimit?: number;
}

export const EditorFooter = ({
  saveStatus,
  lastSaved,
  formatLastSaved,
  onCancel,
  onReset,
  onSubmit,
  clearDraft,
  isSubmitting,
  hideSubmit = false,
  isMac = false,
  canSubmit = true,
  wordCount,
  wordLimit,
}: EditorFooterProps) => {
  const isMobile = useIsMobile();
  const showWordCount = wordCount !== undefined && wordLimit !== undefined;
  const isOverLimit = showWordCount && wordCount > wordLimit;

  return (
    <div className="flex flex-col-reverse mobile:!flex-row justify-between items-start mobile:!items-center px-4 py-2 border-t border-gray-200 gap-2 mobile:!gap-0">
      {/* Left section: Draft status and word count */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {saveStatus === 'saved' && lastSaved && <span>Draft saved {formatLastSaved()}</span>}
        {saveStatus === 'saving' && <span>Saving draft...</span>}
        {showWordCount && (
          <span className={isOverLimit ? 'text-red-600 font-medium' : ''}>
            {wordCount.toLocaleString()} / {wordLimit.toLocaleString()} words
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <Button
            variant="outlined"
            size="sm"
            onClick={() => {
              if (onCancel) onCancel();
              if (onReset) onReset();
              clearDraft();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        {!hideSubmit && (
          <Button
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting || !canSubmit}
          >
            <span className="flex items-center justify-between w-full gap-3">
              <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              {!isSubmitting && !isMobile && (
                <span className="text-xs font-normal opacity-60 bg-white/20 px-2 py-0.5 rounded">
                  {isMac ? '⌘↵' : 'Ctrl+↵'}
                </span>
              )}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
