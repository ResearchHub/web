'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { GraduationCap, Scale, Users, FileText } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { ModalContainer } from '@/components/ui/Modal/ModalContainer';
import { ModalHeader } from '@/components/ui/Modal/ModalHeader';

interface ConfirmPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isPublishing: boolean;
  isUpdate?: boolean;
}

export function ConfirmPublishModal({
  isOpen,
  onClose,
  onConfirm,
  title: initialTitle,
  isPublishing,
  isUpdate,
}: ConfirmPublishModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [hasAgreed, setHasAgreed] = useState(false);
  const { editor } = useNotebookContext();

  const isTitleValid = title.trim().length >= 20;
  const isPublishEnabled = isTitleValid && hasAgreed;

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setHasAgreed(false);
    }
  }, [isOpen, initialTitle]);

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
    <ModalContainer isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="p-6">
        <ModalHeader
          title={isUpdate ? 'Confirm Re-publication' : 'Confirm Publication'}
          onClose={onClose}
        />

        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            You are about to {isUpdate ? 'republish' : 'publish'} your research proposal:
          </p>

          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="w-full p-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter title..."
          />

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Guidelines for posts</h4>
            <ul className="space-y-3">
              {[
                { icon: GraduationCap, text: 'Stick to academically appropriate topics' },
                { icon: Scale, text: 'Focus on presenting objective results and remain unbiased in your commentary' },
                { icon: Users, text: 'Be respectful of differing opinions, viewpoints, and experiences' },
                { icon: FileText, text: 'Do not plagiarize any content, keep it original' },
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <item.icon className="h-[18px] w-[18px] mt-0.5 text-indigo-600 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-gray-600 leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="guidelines"
              checked={hasAgreed}
              disabled={isPublishing}
              onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
            />
            <label htmlFor="guidelines" className="text-sm text-gray-600 cursor-pointer select-none">
              I have adhered to the ResearchHub posting guidelines
            </label>
          </div>

          {!isTitleValid && (
            <Alert variant="error">
              Title must be at least 20 characters long
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={isPublishing}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={onConfirm}
              disabled={!isPublishEnabled || isPublishing}
              className="px-6"
            >
              {isPublishing
                ? 'Publishing...'
                : isUpdate
                  ? 'Confirm & Republish'
                  : 'Confirm & Publish'}
            </Button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}
