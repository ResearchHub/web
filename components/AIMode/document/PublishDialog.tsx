'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useFormContext } from 'react-hook-form';
import { PublishGuidelines } from '@/components/modals/ConfirmPublishModal';
import { NonprofitConfirmModal, NonprofitSearchSection } from '@/components/Nonprofit';
import { usePublishingController } from '@/components/Notebook/PublishingForm';
import { FUNDRAISE_DURATION_HELP } from '@/components/Notebook/PublishingForm/components/EndDateSection';
import {
  GRANT_APPLICATION_VISIBILITY_HELP,
  GRANT_APPLICATION_VISIBILITY_OPTIONS,
} from '@/components/Notebook/PublishingForm/components/GrantApplicationVisibilitySection';
import {
  PROPOSAL_VISIBILITY_OPTIONS,
  useIsLockedPrivate,
  useShowPrivateWarning,
} from '@/components/Notebook/PublishingForm/components/PreregistrationPrivacySection';
import { DEFAULT_FUNDRAISE_END_DAYS } from '@/components/Notebook/PublishingForm/formMapping';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import { Button } from '@/components/ui/Button';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { RadioGroup } from '@/components/ui/form/RadioGroup';
import { usePublishReadiness } from './masthead/usePublishReadiness';
import { MissingDetails, RowButton } from './MissingDetails';

const FUNDRAISE_DAYS = ['30', '60', '90'] as const;

interface PublishDialogProps {
  /** The note's title, from the masthead: what the work is published under. */
  readonly title: string;
  /** Saves a new title, for when the one it has is too short to publish under. */
  readonly onRename: (title: string) => void;
}

/**
 * The workspace's one step between Publish and a published work, and the only
 * place that says what is missing. It opens on every Publish click: whatever
 * the document still needs is listed first, each with a way to add it here;
 * then what the masthead leaves out because it has a sensible default (who
 * can see the work, how long a fundraise runs, a nonprofit); then the posting
 * guidelines to agree to. Its Publish waits until nothing is missing. An
 * update has only the list and the guidelines.
 */
export function PublishDialog({ title, onRename }: PublishDialogProps) {
  const { articleType, workId, isPublishing, dismissConfirmation, confirmPublish } =
    usePublishingController();
  const { watch } = useFormContext<PublishingFormData>();
  const selectedNonprofit = watch('selectedNonprofit');
  const readiness = usePublishReadiness(title);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  // The nonprofit is chosen in here, so its confirmation comes after, in the dialog's place.
  const [confirmingNonprofit, setConfirmingNonprofit] = useState(false);

  const isRfp = articleType === 'grant';
  const isUpdate = Boolean(workId);
  const isNewProposal = articleType === 'preregistration' && !isUpdate;
  const privateNeedsRfp = useShowPrivateWarning() && isNewProposal;

  const action = isUpdate ? 'Update' : 'Publish';
  const canPublish = readiness.ready && hasAgreed && !isPublishing && !privateNeedsRfp;

  const publish = () => {
    if (!canPublish) return;
    if (isNewProposal && selectedNonprofit) setConfirmingNonprofit(true);
    else void confirmPublish(title);
  };

  return (
    <>
      <Transition appear show={!confirmingNonprofit} as={Fragment}>
        {/* Matches BaseModal. */}
        <Dialog
          as="div"
          className="relative z-[9999]"
          onClose={isPublishing ? () => {} : dismissConfirmation}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/40" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                {/* No overflow clipping: the people picker drops its results past the panel. */}
                <DialogPanel
                  data-testid="workspace-publish-dialog"
                  className="flex w-full max-w-[440px] flex-col gap-4 rounded-2xl bg-white p-6 text-left shadow-2xl"
                >
                  <DialogTitle
                    as="h2"
                    className="text-lg font-semibold tracking-tight text-gray-900"
                  >
                    {action} {isRfp ? 'RFP' : 'proposal'}
                  </DialogTitle>

                  <MissingDetails readiness={readiness} title={title} onRename={onRename} />

                  {isNewProposal && <ProposalSettings />}
                  {isRfp && !isUpdate && <RfpSettings />}

                  <div className="border-t border-gray-200 pt-3.5">
                    {showGuidelines && (
                      <PublishGuidelines
                        variant={isRfp ? 'rfp' : 'default'}
                        className="mb-3.5"
                        iconClassName="text-gray-600"
                      />
                    )}
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="workspace-publish-guidelines"
                        checked={hasAgreed}
                        disabled={isPublishing}
                        onCheckedChange={(checked) => setHasAgreed(checked)}
                      />
                      <p className="text-[13px] leading-snug text-gray-600">
                        <label htmlFor="workspace-publish-guidelines">
                          I have adhered to the ResearchHub{' '}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowGuidelines((shown) => !shown)}
                          aria-expanded={showGuidelines}
                          className="underline underline-offset-2 transition-colors hover:text-gray-900"
                        >
                          posting guidelines
                        </button>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5">
                    <Button variant="ghost" onClick={dismissConfirmation} disabled={isPublishing}>
                      Cancel
                    </Button>
                    <Button
                      data-testid="workspace-publish-confirm"
                      variant="default"
                      onClick={publish}
                      disabled={!canPublish}
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPublishing ? 'Publishing...' : action}
                    </Button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {confirmingNonprofit && selectedNonprofit && (
        <NonprofitConfirmModal
          isOpen
          onClose={() => setConfirmingNonprofit(false)}
          onConfirm={() => {
            setConfirmingNonprofit(false);
            void confirmPublish(title);
          }}
          nonprofitName={selectedNonprofit.name}
          ein={selectedNonprofit.ein}
        />
      )}
    </>
  );
}

/**
 * A setting with a default: its name, a line on what it decides, and its
 * choices, each saying what it means, as the notebook's Details tab has them.
 */
function SettingSection({
  label,
  help,
  action,
  children,
}: {
  readonly label: ReactNode;
  readonly help?: ReactNode;
  /** A control at the right of the name, for a setting that is only offered. */
  readonly action?: ReactNode;
  readonly children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-gray-700">{label}</div>
          {help && <p className="mt-0.5 text-xs leading-snug text-gray-500">{help}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/** A rule that comes with a choice, stated in gray under it. */
function SettingNote({ children }: { readonly children: ReactNode }) {
  return <p className="-mt-2 text-xs leading-snug text-gray-600">{children}</p>;
}

/** What a nonprofit does for a proposal, for the moment before one is added. */
const NONPROFIT_HELP =
  'A nonprofit, such as your university’s foundation, can receive the funds for you. Endaoment, a nonprofit community foundation, processes the donations and sends them on, so you never handle payments and donors can get a tax receipt.';

/**
 * A new proposal's settings: who can see it, how long it stays open, and a
 * nonprofit to receive the funds. Two rules come with the first, and the
 * first of them holds back the dialog's Publish: a private proposal needs an
 * RFP, and an RFP that only takes private proposals makes the proposal private.
 */
function ProposalSettings() {
  const { watch, setValue } = useFormContext<PublishingFormData>();
  const isPublic = watch('isPublic');
  const days = watch('fundraiseEndDays') ?? DEFAULT_FUNDRAISE_END_DAYS;
  const isLockedPrivate = useIsLockedPrivate();
  const privateNeedsRfp = useShowPrivateWarning();
  const [nonprofitOpen, setNonprofitOpen] = useState(() => Boolean(watch('selectedNonprofit')));
  // The RFP may have been chosen since the form loaded, which is the only
  // other moment the lock is applied.
  useEffect(() => {
    if (isLockedPrivate && isPublic !== false) setValue('isPublic', false);
  }, [isLockedPrivate, isPublic, setValue]);

  return (
    <>
      {isLockedPrivate ? (
        <SettingSection
          label="Visibility"
          help="The RFP you are applying to only takes private proposals. Only the funder and vetted peer reviewers will be able to view yours."
        />
      ) : (
        <SettingSection label="Visibility">
          <RadioGroup
            size="sm"
            options={PROPOSAL_VISIBILITY_OPTIONS}
            value={isPublic === false ? 'private' : 'public'}
            onChange={(next) => setValue('isPublic', next === 'public', { shouldValidate: true })}
          />
        </SettingSection>
      )}
      {privateNeedsRfp && (
        <SettingNote>In order to submit a private proposal, you must select an RFP.</SettingNote>
      )}

      <SettingSection label="Open for" help={FUNDRAISE_DURATION_HELP}>
        <ButtonGroup
          size="sm"
          className="self-start"
          value={days}
          onChange={(next) =>
            setValue('fundraiseEndDays', next as (typeof FUNDRAISE_DAYS)[number], {
              shouldDirty: true,
            })
          }
          options={FUNDRAISE_DAYS.map((value) => ({ value, label: `${value} days` }))}
        />
      </SettingSection>

      {nonprofitOpen ? (
        <NonprofitSearchSection />
      ) : (
        <SettingSection
          label={
            <>
              Nonprofit <span className="font-normal text-gray-500">optional</span>
            </>
          }
          help={NONPROFIT_HELP}
          action={<RowButton onClick={() => setNonprofitOpen(true)}>Add</RowButton>}
        />
      )}
    </>
  );
}

/** A new RFP's one setting: how its applicants may submit. */
function RfpSettings() {
  const { watch, setValue } = useFormContext<PublishingFormData>();
  const value = watch('applicationVisibility') ?? 'OPTIONAL';

  return (
    <SettingSection label="Application visibility" help={GRANT_APPLICATION_VISIBILITY_HELP}>
      <RadioGroup
        size="sm"
        options={GRANT_APPLICATION_VISIBILITY_OPTIONS}
        value={value}
        onChange={(next) =>
          setValue('applicationVisibility', next as PublishingFormData['applicationVisibility'], {
            shouldValidate: true,
          })
        }
      />
    </SettingSection>
  );
}
