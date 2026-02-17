'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/form/Input';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { getFieldErrorMessage } from '@/utils/form';
import { useCreateExpertSearch } from '@/hooks/useExpertFinder';
import { ExpertFinderService } from '@/services/expertFinder.service';
import { parseResearchHubUrl } from '@/utils/url';
import type { ExpertSearchCreatePayload } from '@/services/expertFinder.service';
import { expertFinderFormSchema, type ExpertFinderFormValues, DEFAULT_STATE } from '../schema';
import { AdvancedConfig } from './AdvancedConfig';
import { SearchSubmissionProgress } from './SearchSubmissionProgress';

const DEFAULT_URL_PLACEHOLDER = 'e.g., https://researchhub.com/paper/123/...';

const defaultValues: ExpertFinderFormValues = {
  url: '',
  advanced: {
    expertCount: 10,
    expertiseLevel: [],
    region: 'All Regions',
    state: DEFAULT_STATE,
    gender: 'All Genders',
    excludedExpertNames: '',
  },
};

export function ExpertFinderForm() {
  const [{ error: submitError }, createSearch] = useCreateExpertSearch();
  const [createdSearchId, setCreatedSearchId] = useState<number | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpertFinderFormValues>({
    resolver: zodResolver(expertFinderFormSchema),
    defaultValues,
    mode: 'onSubmit',
  });

  const onSubmit = async (data: ExpertFinderFormValues) => {
    const { contentType, documentId } = parseResearchHubUrl(data.url.trim());
    setResolveError(null);

    try {
      const unifiedDocumentId = await ExpertFinderService.resolveUnifiedDocumentId(
        contentType,
        documentId
      );

      const adv = data.advanced;
      const excludedNames = adv.excludedExpertNames
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: ExpertSearchCreatePayload = {
        unified_document_id: unifiedDocumentId,
        config: {
          expert_count: adv.expertCount,
          expertise_level: adv.expertiseLevel,
          region: adv.region,
          state: adv.state,
          gender: adv.gender,
        },
        excluded_expert_names: excludedNames.length > 0 ? excludedNames : undefined,
      };

      const response = await createSearch(payload);
      setCreatedSearchId(response.searchId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start search. Please try again.';
      setResolveError(message);
    }
  };

  if (createdSearchId !== null) {
    return <SearchSubmissionProgress searchId={createdSearchId} />;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <Input
          label=""
          required
          placeholder={DEFAULT_URL_PLACEHOLDER}
          error={getFieldErrorMessage(errors.url)}
          {...register('url')}
        />

        <Controller
          name="advanced"
          control={control}
          render={({ field }) => <AdvancedConfig values={field.value} onChange={field.onChange} />}
        />

        {(resolveError || submitError) && (
          <Alert variant="error">{resolveError ?? submitError}</Alert>
        )}

        <LoadingButton
          type="button"
          onClick={() => handleSubmit(onSubmit)()}
          isLoading={isSubmitting}
          loadingText="Starting search..."
        >
          Find Experts
        </LoadingButton>
      </form>
    </div>
  );
}
