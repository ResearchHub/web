'use client';

import { useCallback, useState } from 'react';
import { ArrowRight, MoreHorizontal, Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-hot-toast';
import { DashboardSectionHeader } from '@/components/Funding/dashboard/DashboardSectionHeader';
import { DocumentThumbnail } from '@/components/Funding/dashboard/DocumentThumbnail';
import { FUNDING_KIND_ICON, FUNDING_KIND_LABEL } from '@/components/Funding/fundingKind';
import { type DraftDocument } from '@/components/Funding/dashboard/hooks/useMyFundingDocuments';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { NoteStatusLine } from '@/components/Notebook/NoteStatus';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Carousel } from '@/components/ui/Carousel';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useFundingDocuments } from '@/contexts/FundingDocumentsContext';
import { NoteService } from '@/services/note.service';

interface DraftCarouselProps {
  /** The latest edit first. */
  readonly drafts: DraftDocument[];
  /** How many drafts there are, which can be more than are loaded. */
  readonly count: number;
}

/**
 * The RFPs and proposals the user is still writing, as a row to pick back up
 * from: the page's first group, because a draft is the work that is waiting.
 * A draft's card is dashed, still being drawn; it opens where the user
 * drafts, and can be deleted from the menu in its corner.
 */
export function DraftCarousel({ drafts, count }: DraftCarouselProps) {
  const { openDraft } = useFundingDrafting();
  const { remove } = useFundingDocuments();

  // ---- deleting a draft, behind a confirmation ----
  const [deleting, setDeleting] = useState<DraftDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteDraft = useCallback(async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await NoteService.deleteNote(deleting.note.id);
      setDeleting(null);
      remove(deleting.note.id);
    } catch {
      toast.error('Couldn’t delete the draft. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, [deleting, remove]);

  return (
    <section>
      <DashboardSectionHeader
        title="Continue where you left off"
        meta={`${count} ${count === 1 ? 'draft' : 'drafts'}`}
      />

      {/* The carousel pads its own track; the margin takes that back from the heading. */}
      <Carousel hideArrowsWhenStatic className="-my-3">
        {drafts.map((draft) => (
          <div key={draft.key} className="group relative w-[210px] shrink-0 snap-start">
            <button
              type="button"
              onClick={() => openDraft(draft.note)}
              className="flex h-full w-full flex-col gap-2.5 rounded-xl border border-dashed border-gray-300 bg-white p-3 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              <DocumentThumbnail image={draft.image} />
              <span className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">
                {draft.title}
              </span>
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <FontAwesomeIcon
                    icon={FUNDING_KIND_ICON[draft.kind]}
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  {FUNDING_KIND_LABEL[draft.kind]}
                </span>
                <span aria-hidden="true">·</span>
                <NoteStatusLine published={false} />
              </span>
              <span className="mt-auto flex w-full items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
                <span className="truncate">{draft.detail}</span>
                <span className="flex shrink-0 items-center gap-1 font-medium transition-colors group-hover:text-gray-900">
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </span>
            </button>
            {/* Beside the card's button, not inside it: a button cannot hold a button. */}
            <div className="absolute right-2 top-2">
              <BaseMenu
                align="end"
                trigger={
                  <button
                    type="button"
                    aria-label={`Options for “${draft.title}”`}
                    title="Options"
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </button>
                }
              >
                <BaseMenuItem
                  onSelect={() => setDeleting(draft)}
                  className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </BaseMenuItem>
              </BaseMenu>
            </div>
          </div>
        ))}
      </Carousel>

      <BaseModal
        isOpen={deleting != null}
        onClose={() => (isDeleting ? undefined : setDeleting(null))}
        title="Delete draft?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setDeleting(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => void deleteDraft()}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          “{deleting?.title}” will be deleted, along with anything written in it. This cannot be
          undone.
        </p>
      </BaseModal>
    </section>
  );
}
