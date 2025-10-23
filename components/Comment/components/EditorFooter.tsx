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
}: EditorFooterProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200">
      {/* Draft status */}
      <div className="text-xs text-gray-500">
        {saveStatus === 'saved' && lastSaved && <span>Draft saved {formatLastSaved()}</span>}
        {saveStatus === 'saving' && <span>Saving draft...</span>}
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
          <Button variant="default" size="sm" onClick={onSubmit} disabled={isSubmitting}>
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
