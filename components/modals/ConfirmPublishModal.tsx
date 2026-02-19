import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Editor } from '@tiptap/core';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { GraduationCap, Scale, Users, FileText, type LucideIcon } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';

type ConfirmPublishVariant = 'default' | 'rfp';

interface ConfirmPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isPublishing: boolean;
  editor: Editor | null;
  isUpdate?: boolean;
  variant?: ConfirmPublishVariant;
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

const GUIDELINES: Record<ConfirmPublishVariant, GuidelineConfig> = {
  default: {
    heading: 'Guidelines for posts',
    items: [
      { icon: GraduationCap, text: 'Stick to academically appropriate topics' },
      {
        icon: Scale,
        text: 'Focus on presenting objective results and remain unbiased in your commentary',
      },
      { icon: Users, text: 'Be respectful of differing opinions, viewpoints, and experiences' },
      { icon: FileText, text: 'Do not plagiarize any content, keep it original' },
    ],
  },
  rfp: {
    heading: 'Guidelines for RFPs',
    items: [
      { icon: GraduationCap, text: 'Stick to academically appropriate topics' },
      { icon: Scale, text: 'Clearly describe the scope and expectations for proposals' },
      { icon: Users, text: 'Be transparent about funding amounts and timelines' },
      { icon: FileText, text: 'Include evaluation criteria for submitted proposals' },
    ],
  },
};

export function ConfirmPublishModal({
  isOpen,
  onClose,
  onConfirm,
  title: initialTitle,
  isPublishing,
  editor,
  isUpdate,
  variant = 'default',
  zIndex = 100,
}: ConfirmPublishModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [hasAgreed, setHasAgreed] = useState(false);

  const isTitleValid = title.trim().length >= 20;
  const isPublishEnabled = isTitleValid && hasAgreed;

  const guidelines = GUIDELINES[variant];
  const documentLabel = variant === 'rfp' ? 'RFP' : 'research proposal';

  useEffect(() => {
    setTitle(initialTitle);
    setHasAgreed(false);
  }, [initialTitle]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (editor) {
      editor
        .chain()
        .command(({ tr }) => {
          const pos = 0;
          const node = tr.doc.nodeAt(pos);
          if (node && node.type.name === 'heading') {
            tr.insertText(newTitle, pos + 1, pos + node.nodeSize - 1);
            return true;
          }
          return false;
        })
        .run();
    }
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
                    You are about to {isUpdate ? 'republish' : 'publish'} your {documentLabel}:
                  </p>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full p-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg mb-6 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter title..."
                  />

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-sm text-gray-900 mb-3">{guidelines.heading}</h4>
                    <ul className="space-y-3">
                      {guidelines.items.map((item) => (
                        <li key={item.text} className="flex items-start gap-2">
                          <item.icon
                            className="h-[18px] w-[18px] mt-0.5 text-indigo-600 flex-shrink-0"
                            strokeWidth={2}
                          />
                          <span className="text-sm text-gray-600">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

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
                      variant="default"
                      onClick={onConfirm}
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
