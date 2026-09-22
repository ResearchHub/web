'use client';

import { useFormContext } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { getAvailableNotebookWorkTypes } from '@/components/Notebook/NotebookPrimaryNavigation';
import { PublishingFormSkeleton } from '@/components/skeletons/PublishingFormSkeleton';
import { Button } from '@/components/ui/Button';
import { DOISection } from '@/components/work/components/DOISection';
import { cn } from '@/utils/styles';
import { AuthorsSection } from './components/AuthorsSection';
import { ContactsSection } from './components/ContactsSection';
import { EndDateSection } from './components/EndDateSection';
import { FundingSection } from './components/FundingSection';
import { GrantApplicationVisibilitySection } from './components/GrantApplicationVisibilitySection';
import { GrantDescriptionSection } from './components/GrantDescriptionSection';
import { GrantFundingAmountSection } from './components/GrantFundingAmountSection';
import { GrantOrganizationSection } from './components/GrantOrganizationSection';
import {
  PreregistrationPrivacyLockedAlert,
  PreregistrationPrivacySection,
} from './components/PreregistrationPrivacySection';
import { ResearchCoinSection } from './components/ResearchCoinSection';
import { WorkImageSection } from './components/WorkImageSection';
import { PublishButton } from './PublishButton';
import { usePublishingController } from './PublishingFormProvider';
import type { PublishingFormData } from './schema';

export { PublishingFormProvider, usePublishingController } from './PublishingFormProvider';
export { PublishButton } from './PublishButton';
export { PublishStatusPill } from './PublishStatusPill';
export { usePublishingCompletion } from './completion';

const FEATURE_FLAG_RESEARCH_COIN = false;

const PUBLISHING_FORM_WORK_TYPES = getAvailableNotebookWorkTypes(false);

interface PublishingFormProps {
  bountyAmount?: number | null;
  onBountyClick?: () => void;
  /** Off when the host places the publish button somewhere else. */
  showFooter?: boolean;
}

/**
 * The publishing details for a note: its work type, then the sections that
 * type needs, with the publish button in a sticky footer. Renders inside a
 * `PublishingFormProvider`, which holds the values and the publish flow.
 */
export function PublishingForm({
  bountyAmount,
  onBountyClick,
  showFooter = true,
}: Readonly<PublishingFormProps>) {
  const {
    note,
    readOnly,
    articleType,
    workId,
    isDeclined,
    isPublishing,
    isLinkingNonprofit,
    isRedirecting,
    blockedMessage,
  } = usePublishingController();
  const { setValue } = useFormContext<PublishingFormData>();

  if (!note) {
    return <PublishingFormSkeleton />;
  }

  return (
    <div className="flex w-full flex-col bg-white relative h-full">
      {isPublishing && (
        <div className="absolute inset-0 bg-white/50 z-50 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
          {isLinkingNonprofit && (
            <p className="text-sm text-gray-600">Linking nonprofit organization...</p>
          )}
        </div>
      )}

      <div
        className={cn(
          'flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 relative',
          isRedirecting ? 'overflow-hidden' : 'overflow-y-auto',
          isDeclined && 'pointer-events-none opacity-60'
        )}
      >
        <fieldset
          disabled={readOnly}
          className={cn(
            'm-0 mx-auto w-full max-w-2xl min-w-0 border-0 p-0 pb-6',
            readOnly && 'pointer-events-none opacity-60'
          )}
        >
          {!articleType ? (
            <div className="px-4 py-5 lg:px-6">
              <h3 className="text-sm font-semibold text-gray-900">Select work type</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose how you want to publish this note.
              </p>
              <div className="mt-4 space-y-2">
                {PUBLISHING_FORM_WORK_TYPES.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outlined"
                    onClick={() =>
                      setValue('articleType', option.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="h-auto w-full justify-start border-gray-200 px-4 py-3 text-left hover:border-primary-300 hover:bg-primary-50 focus-visible:ring-primary-500"
                  >
                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs font-normal text-gray-500">
                        {option.description}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {(articleType === 'preregistration' ||
                articleType === 'grant' ||
                articleType === 'registered_report') && <WorkImageSection />}
              {articleType === 'grant' && (
                <>
                  <GrantDescriptionSection />
                  <GrantOrganizationSection />
                </>
              )}
              {articleType === 'grant' ? <ContactsSection /> : <AuthorsSection />}
              {note.post?.doi && (
                <div className="py-3 px-6 space-y-6">
                  <DOISection doi={note.post.doi} />
                </div>
              )}
              {articleType === 'grant' && <GrantFundingAmountSection />}
              {articleType === 'grant' && <GrantApplicationVisibilitySection />}
              {articleType === 'preregistration' && <FundingSection note={note} />}
              {articleType === 'preregistration' && !workId && (
                <div className="py-3 px-6">
                  <EndDateSection />
                </div>
              )}
              {articleType === 'preregistration' && !workId && <PreregistrationPrivacySection />}
              {FEATURE_FLAG_RESEARCH_COIN &&
                articleType !== 'preregistration' &&
                articleType !== 'grant' && (
                  <ResearchCoinSection
                    bountyAmount={bountyAmount ?? null}
                    onBountyClick={onBountyClick ?? (() => {})}
                  />
                )}
            </>
          )}
        </fieldset>
      </div>

      {showFooter && (
        <div className="border-t bg-white p-2 lg:p-6 sticky bottom-0">
          <div className="mx-auto w-full max-w-2xl space-y-3">
            {articleType === 'preregistration' && !workId && <PreregistrationPrivacyLockedAlert />}
            {blockedMessage && <p className="text-sm text-red-600">{blockedMessage}</p>}
            <PublishButton className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
