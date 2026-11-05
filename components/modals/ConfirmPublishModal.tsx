import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { Ban, FlaskConical, HandCoins, Users, FileText, type LucideIcon } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/utils/styles';

export type ConfirmPublishVariant = 'default' | 'rfp';

/** A work cannot be published under a shorter title. */
export const MIN_PUBLISH_TITLE_LENGTH = 20;

interface ConfirmPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (editedTitle: string) => void;
  title: string;
  isPublishing: boolean;
  onTitleChange?: (title: string) => void;
  isUpdate?: boolean;
  variant?: ConfirmPublishVariant;
  documentLabel?: string;
  zIndex?: number;
}

interface GuidelineItem {
  icon: LucideIcon;
  text: string;
}

interface GuidelineConfig {
  heading: string;
  items: GuidelineItem[];
}

/** What an author agrees to when publishing. */
const PUBLISH_GUIDELINES: Record<ConfirmPublishVariant, GuidelineConfig> = {
  default: {
    heading: 'Guidelines for posts',
    items: [
      { icon: FlaskConical, text: 'Stick to scientific topics' },
      { icon: Ban, text: 'Don’t post illegal content or spam' },
      { icon: Users, text: 'Be respectful of differing opinions, viewpoints, and experiences' },
      { icon: FileText, text: 'Do not plagiarize any content, keep it original' },
    ],
  },
  rfp: {
    heading: 'Guidelines for Requests for Proposals',
    items: [
      {
        icon: HandCoins,
        text: 'Only create an RFP if you intend to distribute the stated funding amount.',
      },
      { icon: FileText, text: 'Describe the scope and expectations of your RFP clearly.' },
      { icon: FlaskConical, text: 'Stick to truth-seeking science.' },
    ],
  },
};

interface PublishGuidelinesProps {
  variant: ConfirmPublishVariant;
  className?: string;
  /** The icons' colour; the notebook's indigo unless told otherwise. */
  iconClassName?: string;
}

/** The guidelines an author agrees to, as a gray box: a heading and the list. */
export function PublishGuidelines({
  variant,
  className,
  iconClassName = 'text-indigo-600',
}: PublishGuidelinesProps) {
  const guidelines = PUBLISH_GUIDELINES[variant];
  return (
    <div className={cn('rounded-lg bg-gray-50 p-4', className)}>
      <h4 className="mb-3 text-sm font-medium text-gray-900">{guidelines.heading}</h4>
      <ul className="space-y-3">
        {guidelines.items.map((item) => (
          <li key={item.text} className="flex items-start gap-2">
            <item.icon
              className={cn('mt-0.5 h-[18px] w-[18px] flex-shrink-0', iconClassName)}
              strokeWidth={2}
            />
            <span className="text-sm text-gray-600">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConfirmPublishModal({
  isOpen,
  onClose,
  onConfirm,
  title: initialTitle,
  isPublishing,
  onTitleChange,
  isUpdate,
  variant = 'default',
  documentLabel,
  // Matches BaseModal.
  zIndex = 9999,
}: ConfirmPublishModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [hasAgreed, setHasAgreed] = useState(false);

  const isTitleValid = title.trim().length >= MIN_PUBLISH_TITLE_LENGTH;
  const isPublishEnabled = isTitleValid && hasAgreed;

  const resolvedDocumentLabel =
    documentLabel ?? (variant === 'rfp' ? 'request for proposal' : 'research proposal');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative" style={{ zIndex }} onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black !bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 mb-4">
                    {isUpdate ? 'Confirm Re-publication' : 'Confirm Publication'}
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mb-4">
                    You are about to {isUpdate ? 'republish' : 'publish'} your{' '}
                    {resolvedDocumentLabel}:
                  </p>
                  <input
                    data-testid="confirm-publish-title"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full p-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg mb-6 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter title..."
                  />

                  <PublishGuidelines variant={variant} className="mb-6" />

                  <div className="flex items-start gap-2 mb-6">
                    <Checkbox
                      id="publish-guidelines"
                      checked={hasAgreed}
                      disabled={isPublishing}
                      onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                    />
                    <label htmlFor="publish-guidelines" className="text-sm text-gray-600">
                      I have adhered to the ResearchHub posting guidelines
                    </label>
                  </div>

                  {!isTitleValid && (
                    <Alert variant="error" className="mb-6">
                      Title must be at least 20 characters long
                    </Alert>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      data-testid="confirm-publish-submit"
                      variant="default"
                      onClick={() => onConfirm(title)}
                      disabled={!isPublishEnabled || isPublishing}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPublishing
                        ? 'Publishing...'
                        : isUpdate
                          ? 'Confirm & Republish'
                          : 'Confirm & Publish'}
                    </Button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
