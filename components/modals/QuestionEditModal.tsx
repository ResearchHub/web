'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { CommentEditor } from '@/components/Comment/CommentEditor';
import { CommentContent } from '@/components/Comment/lib/types';
import { SessionProvider, useSession } from 'next-auth/react';
import { HubsSelector, Hub } from '@/app/paper/create/components/HubsSelector';
import { Work } from '@/types/work';
import { PostService } from '@/services/post.service';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface QuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  work: Work;
}

export const QuestionEditModal = ({ isOpen, onClose, work }: QuestionEditModalProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState(work.title);
  const [plainText, setPlainText] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>([]);

  // Initialize hubs from work topics
  useEffect(() => {
    if (work.topics && work.topics.length > 0) {
      const hubs = work.topics.map((topic) => ({
        id: topic.id.toString(),
        name: topic.name,
        slug: topic.slug || '',
      }));
      setSelectedHubs(hubs);
    }
  }, [work.topics]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!plainText || plainText.trim() === '') {
      toast.error('Please enter the question details');
      return;
    }

    if (selectedHubs.length === 0) {
      toast.error('Please select at least one topic');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        post_id: work.id,
        assign_doi: false,
        document_type: work.contentType === 'preregistration' ? 'PREREGISTRATION' : 'QUESTION',
        full_src: htmlContent,
        renderable_text: plainText,
        hubs: selectedHubs.map((h) => Number(h.id)),
        title: title,
      };

      await PostService.upsert(payload);
      toast.success('Question updated successfully');
      onClose();

      // Refresh the page to show updated content
      router.refresh();
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setTitle(work.title);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Question"
      showCloseButton={true}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outlined" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Title */}
        <div>
          <Input
            label="Question title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Question title..."
            required
          />
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
          <SessionAwareCommentEditor
            initialContent={work.previewContent || ''}
            onSubmit={async () => {}}
            placeholder="Describe your question..."
            compactToolbar={true}
            storageKey={`question-edit-modal-${work.id}`}
            showHeader={false}
            showFooter={false}
            onContentChange={(plainTextValue: string, htmlValue: string) => {
              setPlainText(plainTextValue);
              setHtmlContent(htmlValue);
            }}
          />
        </div>

        {/* Topics */}
        <div>
          <HubsSelector
            selectedHubs={selectedHubs}
            onChange={setSelectedHubs}
            error={null}
            hideSelectedItems={true}
          />
        </div>
      </div>
    </BaseModal>
  );
};

// Session-aware wrapper for CommentEditor
const SessionAwareCommentEditor = (props: any) => {
  const { data: session } = useSession();

  if (session) {
    return <CommentEditor {...props} />;
  }

  const mockSession = {
    user: {
      name: 'You',
      fullName: 'You',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    userId: '0',
  };

  return (
    <SessionProvider session={mockSession as any}>
      <CommentEditor {...props} />
    </SessionProvider>
  );
};
