'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Landmark, User, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { PublishGuidelines } from '@/components/modals/ConfirmPublishModal';
import { NonprofitConfirmModal, NonprofitSearchSection } from '@/components/Nonprofit';
import { usePublishingController } from '@/components/Notebook/PublishingForm';
import { FUNDRAISE_DURATION_HELP } from '@/components/Notebook/PublishingForm/components/EndDateSection';
import { GRANT_APPLICATION_VISIBILITY_HELP } from '@/components/Notebook/PublishingForm/components/GrantApplicationVisibilitySection';
import {
  useIsLockedPrivate,
  useShowPrivateWarning,
} from '@/components/Notebook/PublishingForm/components/PreregistrationPrivacySection';
import { DEFAULT_FUNDRAISE_END_DAYS } from '@/components/Notebook/PublishingForm/formMapping';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { cn } from '@/utils/styles';
import { joinNames } from './masthead/mastheadWidgets';
import { usePublishReadiness } from './masthead/usePublishReadiness';
import { PublishDetails } from './PublishDetails';
import { ChoiceList } from './ChoiceList';
import { ApplicationVisibilityChoice, ProposalVisibilityChoice } from './VisibilityChoices';

const FUNDRAISE_DAYS = ['30', '60', '90'] as const;

interface PublishDialogProps {
  /** The document's first heading: what the work is published under. Empty when it has none. */
  readonly title: string;
  /** Writes a title into the heading, for when there is none or it is too short to publish under. */
  readonly onRename: (title: string) => void;
}

/**
 * The workspace's one step between Publish and a published work, and the only
 * place that says what is missing. It opens on every Publish click: every
 * detail the document carries comes first, required then optional, each with
 * its value or a way to add it here; then what the masthead leaves out
 * because it has a sensible default (who can see the work, how long a
 * fundraise runs, a nonprofit); then the posting guidelines to agree to. Its
 * Publish waits until nothing required is missing, and says beside it what
 * is. An update has only the details and the guidelines.
 *
 * Its title and its Publish stay put while the rest scrolls between them, so
 * Publish, and what holds it back, are always in sight. On a phone it is a
 * sheet from the bottom of the screen; from `md` up, a card in the middle.
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
  const { missingNames } = readiness;
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

          <div className="fixed inset-0">
            <div className="flex h-full items-end justify-center md:items-center md:p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-full md:translate-y-0 md:scale-95"
                enterTo="opacity-100 translate-y-0 md:scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 md:scale-100"
                leaveTo="opacity-0 translate-y-full md:translate-y-0 md:scale-95"
              >
                <DialogPanel
                  data-testid="workspace-publish-dialog"
                  className="flex max-h-[calc(100dvh-12px)] w-full flex-col overflow-hidden rounded-t-2xl bg-white text-left shadow-2xl md:max-h-[85vh] md:max-w-[520px] md:rounded-2xl"
                >
                  <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 py-2 pl-4 pr-2 md:border-0 md:px-6 md:pb-1 md:pt-6">
                    <div className="min-w-0 py-1.5 md:py-0">
                      <DialogTitle
                        as="h2"
                        className="text-lg font-semibold tracking-tight text-gray-900"
                      >
                        {action} {isRfp ? 'RFP' : 'proposal'}
                      </DialogTitle>
                      {/* On a phone the Required heading that counts them scrolls away. */}
                      {missingNames.length > 0 && (
                        <p className="text-[13px] text-amber-700 md:hidden">
                          {missingNames.length} required{' '}
                          {missingNames.length === 1 ? 'detail' : 'details'} left
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={dismissConfirmation}
                      disabled={isPublishing}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Scrolls under the title and Publish. The pickers' results drop
                      inside it, so they are scrolled to rather than cut off. */}
                  <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 md:gap-4 md:px-6 md:pb-5 md:pt-3">
                    <PublishDetails readiness={readiness} title={title} onRename={onRename} />

                    {isNewProposal && <ProposalSettings />}
                    {isRfp && !isUpdate && <RfpSettings />}

                    {showGuidelines && (
                      <PublishGuidelines
                        variant={isRfp ? 'rfp' : 'default'}
                        iconClassName="text-gray-600"
                      />
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:px-6 md:pb-6 md:pt-4">
                    <div className="flex items-center gap-2.5 md:items-start md:gap-2">
                      <Checkbox
                        id="workspace-publish-guidelines"
                        checked={hasAgreed}
                        disabled={isPublishing}
                        onCheckedChange={(checked) => setHasAgreed(checked)}
                      />
                      <p className="text-sm leading-snug text-gray-600 md:text-[13px]">
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

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2.5">
                      {missingNames.length > 0 && (
                        <p
                          data-testid="workspace-publish-missing"
                          className="order-last text-center text-[13px] leading-snug text-amber-700 md:order-none md:flex-1 md:text-left"
                        >
                          {missingSentence(missingNames)}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        onClick={dismissConfirmation}
                        disabled={isPublishing}
                        className="hidden md:ml-auto md:inline-flex"
                      >
                        Cancel
                      </Button>
                      <Button
                        data-testid="workspace-publish-confirm"
                        variant="default"
                        onClick={publish}
                        disabled={!canPublish}
                        className="h-12 w-full text-base disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:w-auto md:text-sm"
                      >
                        {isPublishing ? 'Publishing...' : action}
                      </Button>
                    </div>
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

/** "Add title, funding amount and short description to publish". */
function missingSentence(names: readonly string[]): string {
  return `Add ${joinNames(names.map((name) => name.toLowerCase()))} to publish`;
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
          <div className="text-[13px] font-semibold text-gray-900">{label}</div>
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

interface Choice {
  readonly value: string;
  readonly label: string;
}

/** A setting's few choices side by side, as one switch. */
function ChoiceBox({
  label,
  value,
  choices,
  onChange,
}: {
  /** Names the group for assistive technology; the section shows it visibly. */
  readonly label: string;
  readonly value: string;
  readonly choices: readonly Choice[];
  readonly onChange: (value: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-0.5 rounded-lg border border-gray-200 bg-gray-100 p-0.5"
      style={{ gridTemplateColumns: `repeat(${choices.length}, minmax(0, 1fr))` }}
    >
      {choices.map((choice) => {
        const checked = choice.value === value;
        return (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(choice.value)}
            className={cn(
              'flex min-h-11 items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 md:min-h-0 md:text-xs',
              checked ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {choice.label}
          </button>
        );
      })}
    </div>
  );
}

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
  // The RFP may have been chosen since the form loaded, which is the only
  // other moment the lock is applied.
  useEffect(() => {
    if (isLockedPrivate && isPublic !== false) setValue('isPublic', false);
  }, [isLockedPrivate, isPublic, setValue]);

  return (
    <>
      {isLockedPrivate ? (
        <SettingSection label="Visibility" help="This RFP only accepts private proposals." />
      ) : (
        <SettingSection label="Visibility">
          <ProposalVisibilityChoice
            isPublic={isPublic !== false}
            onChange={(next) => setValue('isPublic', next, { shouldValidate: true })}
          />
        </SettingSection>
      )}
      {privateNeedsRfp && (
        <SettingNote>In order to submit a private proposal, you must select an RFP.</SettingNote>
      )}

      <SettingSection label="Open for" help={FUNDRAISE_DURATION_HELP}>
        <ChoiceBox
          label="Open for"
          value={days}
          onChange={(next) =>
            setValue('fundraiseEndDays', next as (typeof FUNDRAISE_DAYS)[number], {
              shouldDirty: true,
            })
          }
          choices={FUNDRAISE_DAYS.map((value) => ({ value, label: `${value} days` }))}
        />
      </SettingSection>

      <FundsRecipient />
    </>
  );
}

type Recipient = 'you' | 'institution';

/**
 * Who a proposal's funds go to: the researcher, or their university's
 * nonprofit foundation, found in the search that opens under that choice.
 * Choosing the researcher again lets go of any foundation picked.
 */
function FundsRecipient() {
  const { watch, setValue } = useFormContext<PublishingFormData>();
  const selectedNonprofit = watch('selectedNonprofit');
  const [recipient, setRecipient] = useState<Recipient>(selectedNonprofit ? 'institution' : 'you');
  // A foundation saved on the note may arrive after the dialog opens.
  useEffect(() => {
    if (selectedNonprofit) setRecipient('institution');
  }, [selectedNonprofit]);

  const choose = (next: Recipient) => {
    setRecipient(next);
    if (next === 'you' && selectedNonprofit) {
      setValue('selectedNonprofit', null, { shouldDirty: true });
      setValue('departmentLabName', '', { shouldDirty: true });
    }
  };

  return (
    <SettingSection label="Who receives the funds">
      <ChoiceList
        label="Who receives the funds"
        options={[
          { value: 'you', label: 'You', icon: User, description: 'Funds go to you directly.' },
          {
            value: 'institution',
            label: 'Your institution',
            icon: Landmark,
            description: "Your university's nonprofit foundation receives them.",
            details: <NonprofitSearchSection compact />,
          },
        ]}
        value={recipient}
        onChange={choose}
      />
    </SettingSection>
  );
}

/** A new RFP's one setting: how its applicants may submit, and what each way gives the funder. */
function RfpSettings() {
  const { watch, setValue } = useFormContext<PublishingFormData>();
  const value = watch('applicationVisibility') ?? 'OPTIONAL';

  return (
    <SettingSection label="Application visibility" help={GRANT_APPLICATION_VISIBILITY_HELP}>
      <ApplicationVisibilityChoice
        value={value}
        onChange={(next) => setValue('applicationVisibility', next, { shouldValidate: true })}
      />
    </SettingSection>
  );
}
