import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

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
}: EditorFooterProps) => {
  const [submitShortcutHint, setSubmitShortcutHint] = useState('Ctrl+Enter');

  useEffect(() => {
    const isMac = typeof window !== 'undefined' && /Mac/i.test(navigator.platform);
    setSubmitShortcutHint(isMac ? '⌘⏎' : 'Ctrl+Enter');
  }, []);

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
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <span className="inline-flex items-center">
                <span>Submit</span>
                <span className="hidden md:!inline-flex items-center space-x-1 ml-2 flex-shrink-0">
                  <span className="text-xs text-primary-200 bg-primary-600 px-2 py-1 rounded font-medium">
                    {submitShortcutHint}
                  </span>
                </span>
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
