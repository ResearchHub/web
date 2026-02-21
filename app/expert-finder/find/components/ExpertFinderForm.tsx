'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { getFieldErrorMessage } from '@/utils/form';
import { useCreateExpertSearch, useWorkByUnifiedDocumentId } from '@/hooks/useExpertFinder';
import { validateResearchHubUrl } from '@/utils/url';
import {
  type ExpertSearchCreatePayload,
  type ExpertiseLevel,
  type InputType,
  type Region,
  DEFAULT_REGION,
  ExpertFinderService,
  EXPERTISE_LEVEL_ALL,
} from '@/services/expertFinder.service';
import { expertFinderFormSchema, type ExpertFinderFormValues, DEFAULT_STATE } from '../schema';
import { AdvancedConfig } from './AdvancedConfig';
import { SearchSubmissionProgress } from './SearchSubmissionProgress';
import { WorkPreviewCard } from './WorkPreviewCard';
import type { Work } from '@/types/work';
import { ExpertSearchResult } from '@/types/expertFinder';

const DEFAULT_URL_PLACEHOLDER = 'e.g., https://researchhub.com/paper/123/...';

function getAvailableInputTypes(work: Work | null): InputType[] {
  if (work?.contentType === 'paper') {
    const hasPdf = (work.formats ?? []).some((f) => f.type === 'PDF');
    return hasPdf ? ['abstract', 'pdf'] : ['abstract'];
  }

  return ['full_content'];
}

const defaultValues: ExpertFinderFormValues = {
  unifiedDocumentId: null,
  url: '',
  advanced: {
    expertCount: 25,
    expertiseLevel: [],
    region: DEFAULT_REGION,
    state: DEFAULT_STATE,
    excludedExpertNames: '',
    inputType: 'full_content',
    searchTitle: '',
  },
};

export function ExpertFinderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [{ error: submitError }, createSearch] = useCreateExpertSearch();
  const [createdSearchId, setCreatedSearchId] = useState<number | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [selectedSearchId, setSelectedSearchId] = useState<number | null>(null);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ExpertFinderFormValues>({
    resolver: zodResolver(expertFinderFormSchema),
    defaultValues,
    mode: 'onSubmit',
  });

  const urlValue = watch('url');
  const unifiedDocumentId = watch('unifiedDocumentId');

  const [{ work: fetchedWork, isLoading: fetchWorkLoading, error: fetchWorkError }] =
    useWorkByUnifiedDocumentId(unifiedDocumentId);

  const availableInputTypes = getAvailableInputTypes(fetchedWork);
  const workLoading = isResolvingUrl || fetchWorkLoading;
  const resolveOrFetchError = resolveError ?? fetchWorkError ?? null;

  const handleFetchWork = useCallback(async () => {
    const url = urlValue?.trim();
    setResolveError(null);
    if (!url) {
      setResolveError('Please enter a document URL.');
      setValue('unifiedDocumentId', null);
      return;
    }
    const result = validateResearchHubUrl(url);
    if (!result.success) {
      setResolveError(result.error);
      setValue('unifiedDocumentId', null);
      return;
    }
    const { contentType, documentId } = result.parsed;
    setIsResolvingUrl(true);
    setValue('unifiedDocumentId', null);
    try {
      const work = await ExpertFinderService.fetchWork(contentType, documentId);
      setValue('unifiedDocumentId', work.unifiedDocumentId ?? null);
      setIsEditingUrl(false);
    } catch {
      setResolveError('Failed to load document. Please check the URL and try again.');
    } finally {
      setIsResolvingUrl(false);
    }
  }, [urlValue, setValue]);

  useEffect(() => {
    if (!isEditingUrl) return;
    if (!urlValue?.trim()) {
      setValue('unifiedDocumentId', null);
    } else {
      const result = validateResearchHubUrl(urlValue.trim());
      if (!result.success) {
        setValue('unifiedDocumentId', null);
      }
    }
  }, [urlValue, isEditingUrl, setValue]);

  useEffect(() => {
    const param = searchParams?.get('unifiedDocumentId');
    const paramId = param ? Number.parseInt(param, 10) : Number.NaN;
    if (param && !Number.isNaN(paramId)) {
      setValue('unifiedDocumentId', paramId);
    }
    if (fetchedWork && !Number.isNaN(paramId) && fetchedWork.unifiedDocumentId === paramId) {
      setIsEditingUrl(false);
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.delete('unifiedDocumentId');
      router.replace(params.toString() ? `?${params}` : globalThis.window.location.pathname, {
        scroll: false,
      });
    }
  }, [searchParams, fetchedWork, setValue, router]);

  const handleRerunSelect = useCallback(
    (search: ExpertSearchResult | null) => {
      setSelectedSearchId(search?.searchId ?? null);
      if (!search) return;
      const config = search.config as Record<string, unknown>;
      const expertCount = (config.expert_count as number) ?? 25;
      const rawLevel = config.expertise_level;
      let expertiseLevel: ExpertiseLevel[];
      if (Array.isArray(rawLevel)) {
        expertiseLevel = rawLevel;
      } else if (rawLevel && rawLevel !== EXPERTISE_LEVEL_ALL) {
        expertiseLevel = [rawLevel as ExpertiseLevel];
      } else {
        expertiseLevel = [];
      }
      const region = (config.region as Region) ?? DEFAULT_REGION;
      const state = (config.state as string) ?? DEFAULT_STATE;
      const inputType = search.inputType;
      const current = getValues();
      const unifiedId = search.work?.unifiedDocumentId ?? null;
      reset({
        ...current,
        unifiedDocumentId: unifiedId,
        url: current.url,
        advanced: {
          expertCount,
          expertiseLevel,
          region,
          state,
          excludedExpertNames: current.advanced.excludedExpertNames ?? '',
          inputType,
          searchTitle: current.advanced.searchTitle ?? '',
        },
      });
      if (search.work) {
        setIsEditingUrl(false);
      }
    },
    [reset, getValues]
  );

  const handleEditWork = useCallback(() => {
    setValue('unifiedDocumentId', null);
    setSelectedSearchId(null);
    setResolveError(null);
    setIsEditingUrl(true);
  }, [setValue]);

  const onSubmit = async (data: ExpertFinderFormValues) => {
    setResolveError(null);
    const unifiedDocumentId = data.unifiedDocumentId;
    if (unifiedDocumentId == null) {
      setResolveError('Please select a document first (paste a URL and click the checkmark).');
      return;
    }

    try {
      const adv = data.advanced;
      const excludedNames = adv.excludedExpertNames
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: ExpertSearchCreatePayload = {
        unified_document_id: unifiedDocumentId,
        input_type: adv.inputType,
        config: {
          expert_count: adv.expertCount,
          expertise_level: adv.expertiseLevel,
          region: adv.region,
          state: adv.state,
        },
        excluded_expert_names: excludedNames.length > 0 ? excludedNames : undefined,
        ...(adv.searchTitle?.trim() && { title: adv.searchTitle.trim() }),
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

  const urlRegister = register('url');

  let documentInputContent: React.ReactNode;
  if (isEditingUrl) {
    documentInputContent = (
      <div className="flex gap-2 items-start">
        <Input
          label=""
          placeholder={DEFAULT_URL_PLACEHOLDER}
          error={resolveOrFetchError ?? undefined}
          className="flex-1 min-w-0"
          {...urlRegister}
        />
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={handleFetchWork}
          disabled={workLoading || !urlValue?.trim()}
          className="shrink-0 mt-0.5"
          aria-label="Fetch work"
        >
          <Check className="h-5 w-5" />
        </Button>
      </div>
    );
  } else if (workLoading) {
    documentInputContent = <WorkPreviewCard isLoading />;
  } else {
    documentInputContent =
      fetchedWork != null ? <WorkPreviewCard work={fetchedWork} onEdit={handleEditWork} /> : null;
  }

  return (
    <div className="space-y-6 mb-[240px]">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {documentInputContent}

        {getFieldErrorMessage(errors.unifiedDocumentId) && (
          <p className="text-sm text-red-500 mt-1" role="alert">
            {getFieldErrorMessage(errors.unifiedDocumentId)}
          </p>
        )}

        <Controller
          name="advanced"
          control={control}
          render={({ field }) => (
            <AdvancedConfig
              values={field.value}
              onChange={field.onChange}
              errors={errors.advanced}
              availableInputTypes={availableInputTypes}
              contentType={fetchedWork?.contentType}
              onRerunSelect={handleRerunSelect}
              selectedSearchId={selectedSearchId}
            />
          )}
        />

        {(resolveOrFetchError || submitError) && (
          <Alert variant="error">{resolveOrFetchError ?? submitError}</Alert>
        )}

        <LoadingButton
          type="button"
          onClick={() =>
            handleSubmit(onSubmit, (err) => {
              console.error(err);
              setResolveError(
                err instanceof Error ? err.message : 'Failed to start search. Please try again.'
              );
            })()
          }
          isLoading={isSubmitting}
          loadingText="Starting search..."
        >
          Find Experts
        </LoadingButton>
      </form>
    </div>
  );
}
