import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { toast } from 'react-hot-toast';
import { ReviewCategory } from '../ReviewCategories';
import { CommentContent } from '../types';

interface UseEditorHandlersProps {
  editor: Editor | null;
  onSubmit: (content: {
    content: CommentContent;
    rating?: number;
    sectionRatings?: Record<string, number>;
  }) => Promise<boolean | void> | void;
  isReview: boolean;
  rating: number;
  sectionRatings: Record<string, number>;
  clearDraft: () => void;
  setRating: (rating: number) => void;
  setSectionRatings: (ratings: Record<string, number>) => void;
}

export const useEditorHandlers = ({
  editor,
  onSubmit,
  isReview,
  rating,
  sectionRatings,
  clearDraft,
  setRating,
  setSectionRatings,
}: UseEditorHandlersProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkMenuPosition, setLinkMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedLink, setSelectedLink] = useState<{ url: string; text: string } | null>(null);

  const handleSubmit = async () => {
    // Check if editor exists
    if (!editor) return;

    // Validate content
    const hasContent = editor.getText().trim().length > 0;
    if (!hasContent) {
      toast.error('Please add some content before submitting.');
      return;
    }

    // Validate rating for reviews
    if (isReview) {
      if (rating === 0) {
        toast.error('Please provide an overall rating (1-5 stars) before submitting your review.');
        return;
      }
    }

    const currentSectionRatings: Record<string, number> = {};
    let overallRating = rating;

    if (isReview) {
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'sectionHeader') {
          currentSectionRatings[node.attrs.sectionId] = node.attrs.rating;
          if (node.attrs.sectionId === 'overall') {
            overallRating = node.attrs.rating;
          }
        }
      });

      const hasUnratedSections = Object.values(currentSectionRatings).some(
        (rating) => rating === 0
      );
      if (hasUnratedSections) {
        toast.error('Please rate all sections before submitting.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const json = editor.getJSON();

      const result = await onSubmit({
        content: json as CommentContent,
        rating: isReview ? overallRating : undefined,
        sectionRatings:
          isReview && Object.keys(currentSectionRatings).length > 0
            ? currentSectionRatings
            : undefined,
      });

      // Only clear the editor if submission was successful
      if (result !== false) {
        clearDraft();
        editor.commands.clearContent();
        if (isReview) {
          setRating(0);
          setSectionRatings({});
        }
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkAdd = () => {
    if (!editor) return;

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    );

    setSelectedLink({
      url: '',
      text: selectedText || '',
    });
    setIsLinkModalOpen(true);
  };

  const handleLinkSave = (url: string, text?: string) => {
    if (!editor) return;

    if (selectedLink && editor.isActive('link')) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .command(({ tr, state }) => {
          if (text && text !== selectedLink.text) {
            const { from, to } = state.selection;
            tr.insertText(text, from, to);
          }
          return true;
        })
        .run();
    } else if (text) {
      if (editor.state.selection.empty) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: text,
            marks: [
              {
                type: 'link',
                attrs: { href: url },
              },
            ],
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setLink({ href: url })
          .command(({ tr, state }) => {
            if (
              text !== editor.state.doc.textBetween(state.selection.from, state.selection.to, ' ')
            ) {
              const { from, to } = state.selection;
              tr.insertText(text, from, to);
            }
            return true;
          })
          .run();
      }
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }

    setIsLinkModalOpen(false);
    setLinkMenuPosition(null);
    setSelectedLink(null);
  };

  const handleImageEmbed = (imageUrl: string) => {
    editor?.chain().focus().setImage({ src: imageUrl }).run();
    setIsImageModalOpen(false);
  };

  const handleAddReviewCategory = (category: ReviewCategory) => {
    if (!editor) return;

    if (editor.getText().length > 0) {
      editor.chain().focus().setHardBreak().run();
    }

    const content = {
      type: 'doc',
      content: [
        {
          type: 'sectionHeader',
          attrs: {
            sectionId: category.id,
            title: category.title,
            description: category.description,
            rating: 0,
          },
        },
      ],
    };

    editor.chain().focus().insertContent(content).run();
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!editor) return;

    const link = (event.target as HTMLElement).closest('a');
    if (link) {
      event.preventDefault();
      const rect = link.getBoundingClientRect();
      setLinkMenuPosition({ x: rect.left, y: rect.bottom + window.scrollY });
      setSelectedLink({ url: link.href, text: link.textContent || '' });
    } else {
      setLinkMenuPosition(null);
      setSelectedLink(null);
    }
  };

  return {
    isSubmitting,
    isImageModalOpen,
    setIsImageModalOpen,
    isLinkModalOpen,
    setIsLinkModalOpen,
    linkMenuPosition,
    setLinkMenuPosition,
    selectedLink,
    setSelectedLink,
    handleSubmit,
    handleLinkAdd,
    handleLinkSave,
    handleImageEmbed,
    handleAddReviewCategory,
    handleLinkClick,
  };
};
