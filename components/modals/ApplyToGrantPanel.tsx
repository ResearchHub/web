'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { documentTarget, newDraftTarget, workspaceHref } from '@/components/AIMode/workspaceUrl';
import { Button } from '@/components/ui/Button';
import { PinnedFooter } from '@/components/ui/PinnedFooter';
import { SidePanel } from '@/components/ui/SidePanel';
import { FULL_DRAWER_HEIGHT, SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { NoteService } from '@/services/note.service';
import type { GrantApplicationVisibility } from '@/types/grant';
import type { Note } from '@/types/note';
import { formatCurrency } from '@/utils/currency';
import { formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';

const DraftsSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="px-3 py-2 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="h-3.5 w-16 bg-gray-200 rounded-full animate-pulse mb-1.5"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
        </div>
      </div>
    ))}
  </div>
);

/** A new proposal is drafted with AI in the workspace, or written in the editor. */
type NewDraftMethod = 'ai' | 'editor';

const NEW_DRAFT_OPTIONS: { method: NewDraftMethod; label: string; description: string }[] = [
  {
    method: 'ai',
    label: 'Draft it with AI',
    description: 'Opens the AI workspace to draft a proposal.',
  },
  {
    method: 'editor',
    label: 'Write it yourself',
    description: 'A blank proposal in the editor, with this RFP attached.',
  },
];

const optionClass = (selected: boolean) =>
  cn(
    'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
    selected
      ? 'border-primary-500 bg-primary-50/60 ring-1 ring-primary-500'
      : 'border-gray-200 bg-white hover:border-gray-300'
  );

const RadioDot = ({ selected }: { selected: boolean }) => (
  <span
    aria-hidden="true"
    className={cn(
      'mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-white',
      selected ? 'border-[6px] border-primary-500' : 'border-[1.5px] border-gray-300'
    )}
  />
);

interface ApplyToGrantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  grantId: string;
  applicationVisibility?: GrantApplicationVisibility;
  /** At the top: the RFP's cover card, which names it. */
  cover: ReactNode;
  /** The RFP's own award, "Up to $X". */
  amountUsd?: number;
  organization?: string;
}

/**
 * Applying to an RFP, from the right on desktop and as a drawer on phones:
 * start a proposal, with AI or by hand, or bring one of your drafts.
 */
export function ApplyToGrantPanel({
  isOpen,
  onClose,
  grantId,
  applicationVisibility,
  cover,
  amountUsd,
  organization,
}: ApplyToGrantPanelProps) {
  const [draftNotes, setDraftNotes] = useState<Note[]>([]);
  const [newDraftMethod, setNewDraftMethod] = useState<NewDraftMethod | null>('ai');
  const [selectedDraftNoteId, setSelectedDraftNoteId] = useState<string | null>(null);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const { user } = useUser();
  const { selectedOrg } = useOrganizationContext();
  const router = useRouter();
  const isMobile = useIsMobile();

  const selectedDraftNote = draftNotes.find((n) => n.id.toString() === selectedDraftNoteId);

  const handleSelectNewDraftMethod = (method: NewDraftMethod) => {
    setNewDraftMethod(method);
    setSelectedDraftNoteId(null);
  };

  const handleSelectDraftNote = (id: string) => {
    setSelectedDraftNoteId(id);
    setNewDraftMethod(null);
  };

  // The workspace picks its RFP on its own start screen; it can't be handed one yet.
  const handleDraftWithAI = () => {
    onClose();
    router.push(workspaceHref(newDraftTarget('need_funding')));
  };

  const handleDraftInEditor = () => {
    onClose();
    router.push(`/notebook?newFunding=true&selectedGrantId=${encodeURIComponent(grantId)}`);
  };

  const handleContinueWithDraft = async () => {
    if (!selectedDraftNote) return;

    setIsSavingSelection(true);
    try {
      await NoteService.updateNote({ noteId: selectedDraftNote.id, selectedGrantId: grantId });
      onClose();
      router.push(workspaceHref(documentTarget(selectedDraftNote.id)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to select RFP');
    } finally {
      setIsSavingSelection(false);
    }
  };

  const handleStart = () => {
    if (newDraftMethod === 'ai') handleDraftWithAI();
    else if (newDraftMethod === 'editor') handleDraftInEditor();
    else void handleContinueWithDraft();
  };

  const handleClose = () => {
    if (!isSavingSelection) onClose();
  };

  // Each opening starts on drafting with AI, as the most direct way in.
  useEffect(() => {
    if (!isOpen) return;
    setSelectedDraftNoteId(null);
    setNewDraftMethod('ai');
  }, [isOpen]);

  // The organization can arrive after the panel opens; loading its drafts then
  // leaves a choice already made alone.
  useEffect(() => {
    if (isOpen && user?.id) fetchDraftNotes();
  }, [isOpen, user?.id, selectedOrg?.slug]);

  const fetchDraftNotes = async () => {
    if (!user?.id || !selectedOrg?.slug) {
      setDraftNotes([]);
      return;
    }

    setIsLoadingDrafts(true);
    try {
      const response = await NoteService.getOrganizationNotes(selectedOrg.slug, {
        status: 'DRAFT',
        documentType: 'PREREGISTRATION',
      });
      setDraftNotes(response.results);
    } catch (error) {
      console.error('Error fetching draft notes:', error);
      setDraftNotes([]);
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  const content = (
    <div
      className={cn(
        'flex min-h-full flex-col gap-5',
        !isMobile && 'p-6',
        isSavingSelection && 'pointer-events-none opacity-50'
      )}
    >
      {cover}

      {amountUsd ? (
        <div>
          <p className="text-[22px] font-extrabold tracking-tight text-gray-900">
            Up to{' '}
            <span className="font-mono font-semibold text-green-700">
              {formatCurrency({
                amount: amountUsd,
                showUSD: true,
                exchangeRate: 1,
                skipConversion: true,
              })}
            </span>
          </p>
          {organization && <p className="mt-1 text-sm text-gray-600">Funded by {organization}.</p>}
        </div>
      ) : null}

      <fieldset className="min-w-0">
        <legend className="text-[13px] font-semibold text-gray-600">
          How do you want to write it?
        </legend>
        <div className="mt-2 flex flex-col gap-2">
          {NEW_DRAFT_OPTIONS.map((option) => {
            const selected = newDraftMethod === option.method;
            return (
              <label
                key={option.method}
                data-testid={option.method === 'editor' ? 'apply-draft-new' : undefined}
                className={optionClass(selected)}
              >
                <input
                  type="radio"
                  name="apply-method"
                  className="sr-only"
                  checked={selected}
                  onChange={() => handleSelectNewDraftMethod(option.method)}
                />
                <RadioDot selected={selected} />
                <span>
                  <span className="block text-[15px] font-semibold text-gray-900">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-[18px] text-gray-600">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {isLoadingDrafts ? (
        <DraftsSkeleton />
      ) : (
        draftNotes.length > 0 && (
          // min-w-0: a fieldset is as wide as its content by default, so a long
          // draft title would push it past the panel instead of truncating.
          <fieldset className="min-w-0">
            <legend className="text-[13px] font-semibold text-gray-600">Or continue a draft</legend>
            <div className="mt-2 flex flex-col gap-2">
              {draftNotes.map((note) => {
                const noteId = note.id.toString();
                const selected = noteId === selectedDraftNoteId;
                return (
                  <label key={noteId} className={optionClass(selected)}>
                    <input
                      type="radio"
                      name="apply-method"
                      className="sr-only"
                      checked={selected}
                      onChange={() => handleSelectDraftNote(noteId)}
                    />
                    <RadioDot selected={selected} />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-gray-900">
                        {note.title || 'Untitled'}
                      </span>
                      {note.createdDate && (
                        <span className="mt-0.5 block text-[13px] text-gray-600">
                          Draft · {formatTimestamp(note.createdDate, false)}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )
      )}

      {applicationVisibility === 'PRIVATE' && (
        <div className="flex gap-2 rounded-lg border border-primary-100 bg-primary-50 p-3 text-xs text-primary-800">
          <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold">Private submission.</span> Only funders and vetted peer
            reviewers will be able to view your proposal.
          </p>
        </div>
      )}

      <PinnedFooter container={isMobile ? 'drawer' : 'panel'} className="flex items-center gap-2.5">
        <Button variant="outlined" onClick={handleClose} disabled={isSavingSelection}>
          Cancel
        </Button>
        <Button
          data-testid="apply-continue"
          onClick={handleStart}
          disabled={!(newDraftMethod || selectedDraftNote) || isSavingSelection}
          className="flex-1"
        >
          {isSavingSelection
            ? 'Saving...'
            : selectedDraftNote
              ? 'Continue with this draft'
              : 'Start a proposal'}
        </Button>
      </PinnedFooter>
    </div>
  );

  return isMobile ? (
    <SwipeableDrawer
      isOpen={isOpen}
      onClose={handleClose}
      height={FULL_DRAWER_HEIGHT}
      header={
        <div className="border-b border-gray-200 pb-3">
          <span className="text-lg font-semibold text-gray-900">Apply to RFP</span>
        </div>
      }
    >
      {content}
    </SwipeableDrawer>
  ) : (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      title="Apply to RFP"
      widthClassName="w-full tablet:max-w-[440px]"
    >
      {content}
    </SidePanel>
  );
}
