'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { Plus, Files, PenLine, HelpCircle, Lock, ArrowRight, X } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import AnimatedProposal from '@/components/Proposal/AnimatedProposal';
import { NoteService } from '@/services/note.service';
import { setPendingGrant } from '@/components/Editor/lib/utils/publishingFormStorage';
import { useUser } from '@/contexts/UserContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import type { GrantApplicationVisibility } from '@/types/grant';
import type { Note } from '@/types/note';
import type { ProposalForModal } from '@/services/post.service';

const ProposalSkeleton = () => (
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

interface ApplyToGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseSelected: (proposal: ProposalForModal) => void;
  grantId: string;
  grantTitle?: string;
  grantAmountUsd?: number;
  grantShortTitle?: string;
  grantImageUrl?: string;
  grantOrganization?: string;
  grantApplicationVisibility?: GrantApplicationVisibility;
}

export const ApplyToGrantModal: React.FC<ApplyToGrantModalProps> = ({
  isOpen,
  onClose,
  grantId,
  grantTitle,
  grantAmountUsd,
  grantShortTitle,
  grantImageUrl,
  grantOrganization,
  grantApplicationVisibility,
}) => {
  const [draftNotes, setDraftNotes] = useState<Note[]>([]);
  const [selectedDraftNoteId, setSelectedDraftNoteId] = useState<string | null>(null);
  const [draftNewSelected, setDraftNewSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { selectedOrg } = useOrganizationContext();
  const router = useRouter();

  const selectedDraftNote = draftNotes.find((n) => n.id.toString() === selectedDraftNoteId);

  const setPendingGrantForGrant = () => {
    setPendingGrant({
      id: grantId,
      shortTitle: grantShortTitle || grantTitle || '',
      imageUrl: grantImageUrl || '',
      fundingAmount: grantAmountUsd || 0,
      organization: grantOrganization || '',
      applicationVisibility: grantApplicationVisibility,
    });
  };

  const handleSelectDraftNew = () => {
    setDraftNewSelected(true);
    setSelectedDraftNoteId(null);
  };

  const handleSelectDraftNote = (id: string) => {
    setSelectedDraftNoteId(id);
    setDraftNewSelected(false);
  };

  const handleDraftNew = () => {
    setPendingGrantForGrant();
    onClose();
    router.push('/notebook?newFunding=true');
  };

  const handleContinueWithDraft = () => {
    if (!selectedDraftNote) return;

    setPendingGrantForGrant();
    onClose();
    router.push(
      `/notebook/${selectedDraftNote.organization.slug}/${selectedDraftNote.id}?tab=details`
    );
  };

  const handleFooterAction = () => {
    if (draftNewSelected) {
      handleDraftNew();
      return;
    }
    handleContinueWithDraft();
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedDraftNoteId(null);
      setDraftNewSelected(false);
      if (user?.id) {
        fetchDraftNotes();
      }
    }
  }, [isOpen, user?.id, selectedOrg?.slug]);

  const fetchDraftNotes = async () => {
    if (!user?.id || !selectedOrg?.slug) {
      setDraftNotes([]);
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const hasSelection = draftNewSelected || selectedDraftNote;

  const renderDraftNoteCard = (note: Note) => {
    const noteId = note.id.toString();
    const isSelected = noteId === selectedDraftNoteId && !draftNewSelected;

    return (
      <div
        key={noteId}
        onClick={() => handleSelectDraftNote(noteId)}
        className={cn(
          'px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200',
          isSelected
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Badge variant="default" size="sm">
                Draft
              </Badge>
              {note.createdDate && (
                <>
                  <span className="text-gray-300">&middot;</span>
                  <span className="text-[11px] text-gray-400">{formatDate(note.createdDate)}</span>
                </>
              )}
            </div>
            <h4 className="mt-0.5 truncate text-sm font-medium leading-snug text-gray-900">
              {note.title || 'Untitled'}
            </h4>
          </div>
          <input
            type="radio"
            name="proposal-option"
            value={noteId}
            checked={isSelected}
            onChange={() => handleSelectDraftNote(noteId)}
            className="w-4 h-4 flex-shrink-0 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      padding="p-0"
      className="md:!w-auto md:!h-auto md:!max-h-[88vh] md:!rounded-2xl md:!max-w-[760px]"
    >
      <div className="flex h-full flex-col md:flex-row">
        {/* Left visual rail */}
        <div className="relative flex flex-shrink-0 flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#f8fbff,#eef4ff_60%,#e7eeff)] px-8 py-5 md:w-[300px] md:px-9 md:py-8">
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-500 transition-colors hover:bg-black/10 hover:text-gray-700 md:hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Soft glow blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full opacity-50 blur-[40px]"
            style={{ background: '#ffd9b0' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full opacity-50 blur-[40px]"
            style={{ background: '#bcd2ff' }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-2 flex h-[100px] items-center justify-center md:h-[230px]">
              <div className="origin-center scale-[0.42] md:scale-100">
                <AnimatedProposal scale={0.66} />
              </div>
            </div>
            <Dialog.Title
              as="h2"
              className="text-[26px] font-bold leading-[1.12] tracking-[-0.02em] text-gray-900"
            >
              Apply to Funding
            </Dialog.Title>
            {grantTitle && (
              <p className="mt-3 text-base leading-[1.5] text-gray-600">{grantTitle}</p>
            )}
          </div>
        </div>

        {/* Right content */}
        <div className="relative flex min-h-0 flex-1 flex-col p-6 md:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 md:inline-flex"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center justify-between pr-10">
            <h3 className="text-sm font-medium text-gray-900">Choose how to apply</h3>
            <Tooltip
              content="Proposals are an ideal format for applying to funding. Share your research plan and funding needs upfront."
              position="bottom"
              width="w-72"
            >
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 cursor-help border-b border-dashed border-gray-400">
                <HelpCircle className="w-3 h-3" />
                What is a proposal?
              </span>
            </Tooltip>
          </div>

          <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 md:max-h-[360px]">
            <div
              onClick={handleSelectDraftNew}
              className={cn(
                'px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200',
                draftNewSelected
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <Plus size={18} className="text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-900 flex-1">
                  Draft a new proposal
                </span>
                <input
                  type="radio"
                  name="proposal-option"
                  checked={draftNewSelected}
                  onChange={handleSelectDraftNew}
                  className="w-4 h-4 flex-shrink-0 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <ProposalSkeleton />
            ) : (
              <>
                {draftNotes.map(renderDraftNoteCard)}
                {draftNotes.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Files className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Your draft proposals will appear here</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {grantApplicationVisibility === 'PRIVATE' && (
              <div className="rounded-lg border border-primary-600 bg-primary-50 p-3">
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 flex-shrink-0 text-primary-700" />
                  <p className="text-xs font-medium text-primary-900">Private submission</p>
                </div>
                <p className="mt-1 text-xs text-primary-700">
                  Only funders and vetted peer-reviewers will be able to view your proposal.
                </p>
              </div>
            )}
            <Button
              variant={draftNewSelected ? 'dark' : 'default'}
              onClick={handleFooterAction}
              disabled={!hasSelection}
              className="w-full"
              size="lg"
            >
              {draftNewSelected ? (
                <>
                  <PenLine size={16} className="mr-2" />
                  Start drafting
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
