'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ExpertFinderService,
  type CreateDraftEmailPayload,
  type CreateSavedTemplatePayload,
  type ExpertSearchCreatePayload,
  type GenerateEmailPayload,
  type UpdateGeneratedEmailPayload,
  type UpdateSavedTemplatePayload,
} from '@/services/expertFinder.service';
import type {
  ExpertSearchCreated,
  ExpertSearchResult,
  ExpertSearchListItem,
  GeneratedEmail,
  SavedTemplate,
} from '@/types/expertFinder';
import type { Work } from '@/types/work';

// ── useExpertSearchDetail ────────────────────────────────────────────────────

interface UseExpertSearchDetailState {
  searchDetail: ExpertSearchResult | null;
  isLoading: boolean;
  error: string | null;
}

type FetchExpertSearchDetailFn = () => Promise<void>;
type UseExpertSearchDetailReturn = [UseExpertSearchDetailState, FetchExpertSearchDetailFn];

/**
 * Fetches a single expert search by id.
 */
export function useExpertSearchDetail(
  searchId: number | string | null
): UseExpertSearchDetailReturn {
  const [searchDetail, setSearchDetail] = useState<ExpertSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (searchId == null) return;
    try {
      setIsLoading(true);
      setError(null);
      const detail = await ExpertFinderService.getSearch(searchId);
      setSearchDetail(detail);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch search detail';
      setError(message);
      setSearchDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchId]);

  useEffect(() => {
    if (searchId != null) {
      fetch();
    } else {
      setSearchDetail(null);
      setError(null);
    }
  }, [searchId, fetch]);

  return [{ searchDetail, isLoading, error }, fetch];
}

// ── useExpertSearches ─────────────────────────────────────────────────────────

interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

interface UseExpertSearchesState {
  searches: ExpertSearchListItem[];
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

interface UseExpertSearchesParams {
  limit?: number;
  offset?: number;
  immediate?: boolean;
}

type FetchExpertSearchesFn = (params?: UseExpertSearchesParams) => Promise<void>;
type UseExpertSearchesReturn = [UseExpertSearchesState, FetchExpertSearchesFn];

/**
 * Lists expert searches with pagination.
 */
export function useExpertSearches(params?: UseExpertSearchesParams): UseExpertSearchesReturn {
  const limit = params?.limit ?? 10;
  const offset = params?.offset ?? 0;

  const [searches, setSearches] = useState<ExpertSearchListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit,
    offset,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (fetchParams?: UseExpertSearchesParams) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await ExpertFinderService.listSearches(fetchParams ?? params);
        setSearches(response.searches);
        setPagination({
          total: response.total,
          limit: response.limit,
          offset: response.offset,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch expert searches';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [params?.limit, params?.offset]
  );

  const immediate = params?.immediate !== false;
  useEffect(() => {
    if (immediate) fetch();
  }, [immediate, fetch]);

  return [{ searches, pagination, isLoading, error }, fetch];
}

// ── useCreateExpertSearch ─────────────────────────────────────────────────────

interface UseCreateExpertSearchState {
  created: ExpertSearchCreated | null;
  isLoading: boolean;
  error: string | null;
}

type CreateExpertSearchFn = (payload: ExpertSearchCreatePayload) => Promise<ExpertSearchCreated>;
type UseCreateExpertSearchReturn = [UseCreateExpertSearchState, CreateExpertSearchFn];

/**
 * Create a new expert search.
 */
export function useCreateExpertSearch(): UseCreateExpertSearchReturn {
  const [created, setCreated] = useState<ExpertSearchCreated | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSearch = useCallback(
    async (payload: ExpertSearchCreatePayload): Promise<ExpertSearchCreated> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ExpertFinderService.createSearch(payload);
        setCreated(response);
        return response;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create expert search';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return [{ created, isLoading, error }, createSearch];
}

// ── useWorkByUnifiedDocumentId ───────────────────────────────────────────────

interface UseWorkByUnifiedDocumentIdState {
  work: Work | null;
  isLoading: boolean;
  error: string | null;
}

type FetchWorkByUnifiedDocumentIdFn = () => Promise<void>;
type UseWorkByUnifiedDocumentIdReturn = [
  UseWorkByUnifiedDocumentIdState,
  FetchWorkByUnifiedDocumentIdFn,
];

/**
 * Fetches a work by unified document ID.
 */
export function useWorkByUnifiedDocumentId(
  unifiedDocumentId: number | null
): UseWorkByUnifiedDocumentIdReturn {
  const [work, setWork] = useState<Work | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (unifiedDocumentId == null) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await ExpertFinderService.fetchWorkByUnifiedDocumentId(unifiedDocumentId);
      setWork(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch work';
      setError(message);
      setWork(null);
    } finally {
      setIsLoading(false);
    }
  }, [unifiedDocumentId]);

  useEffect(() => {
    if (unifiedDocumentId != null) {
      fetch();
    } else {
      setWork(null);
      setError(null);
    }
  }, [unifiedDocumentId, fetch]);

  return [{ work, isLoading, error }, fetch];
}

// ── useGenerateEmail ────────────────────────────────────────────────────────

interface UseGenerateEmailState {
  subject: string | null;
  body: string | null;
  email: GeneratedEmail | null;
  isLoading: boolean;
  error: string | null;
}

type GenerateEmailFn = (
  payload: GenerateEmailPayload,
  options?: { save?: boolean; action?: 'generate' }
) => Promise<{ subject: string; body: string } | GeneratedEmail>;

type UseGenerateEmailReturn = [UseGenerateEmailState, GenerateEmailFn];

/**
 * Generate an outreach email (LLM). Preview-only sets subject/body; save creates a draft and sets email.
 */
export function useGenerateEmail(): UseGenerateEmailReturn {
  const [subject, setSubject] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [email, setEmail] = useState<GeneratedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEmail = useCallback(
    async (
      payload: GenerateEmailPayload,
      options?: { save?: boolean; action?: 'generate' }
    ): Promise<{ subject: string; body: string } | GeneratedEmail> => {
      setIsLoading(true);
      setError(null);
      setSubject(null);
      setBody(null);
      setEmail(null);
      try {
        const result = await ExpertFinderService.generateEmail(payload, options);
        if ('subject' in result && 'body' in result && !('id' in result)) {
          setSubject(result.subject);
          setBody(result.body);
          return result;
        }
        setEmail(result as GeneratedEmail);
        setSubject((result as GeneratedEmail).emailSubject);
        setBody((result as GeneratedEmail).emailBody);
        return result as GeneratedEmail;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate email';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return [{ subject, body, email, isLoading, error }, generateEmail];
}

// ── useGeneratedEmails ──────────────────────────────────────────────────────

interface UseGeneratedEmailsState {
  emails: GeneratedEmail[];
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

interface UseGeneratedEmailsParams {
  limit?: number;
  offset?: number;
  immediate?: boolean;
}

type FetchGeneratedEmailsFn = (params?: UseGeneratedEmailsParams) => Promise<void>;
type UseGeneratedEmailsReturn = [UseGeneratedEmailsState, FetchGeneratedEmailsFn];

/**
 * Lists generated emails with pagination.
 */
export function useGeneratedEmails(params?: UseGeneratedEmailsParams): UseGeneratedEmailsReturn {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  const [emails, setEmails] = useState<GeneratedEmail[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit,
    offset,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (fetchParams?: UseGeneratedEmailsParams) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await ExpertFinderService.listEmails(fetchParams ?? params);
        setEmails(response.emails);
        setPagination({
          total: response.total,
          limit: response.limit,
          offset: response.offset,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch emails';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [params?.limit, params?.offset]
  );

  const immediate = params?.immediate !== false;
  useEffect(() => {
    if (immediate) fetch();
  }, [immediate, fetch]);

  return [{ emails, pagination, isLoading, error }, fetch];
}

// ── useGeneratedEmailDetail ──────────────────────────────────────────────────

interface UseGeneratedEmailDetailState {
  email: GeneratedEmail | null;
  isLoading: boolean;
  error: string | null;
}

type FetchGeneratedEmailDetailFn = () => Promise<void>;
type UseGeneratedEmailDetailReturn = [UseGeneratedEmailDetailState, FetchGeneratedEmailDetailFn];

/**
 * Fetches a single generated email by id.
 */
export function useGeneratedEmailDetail(
  emailId: number | string | null
): UseGeneratedEmailDetailReturn {
  const [email, setEmail] = useState<GeneratedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (emailId == null) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await ExpertFinderService.getEmail(emailId);
      setEmail(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch email';
      setError(message);
      setEmail(null);
    } finally {
      setIsLoading(false);
    }
  }, [emailId]);

  useEffect(() => {
    if (emailId != null) {
      fetch();
    } else {
      setEmail(null);
      setError(null);
    }
  }, [emailId, fetch]);

  return [{ email, isLoading, error }, fetch];
}

// ── useCreateDraftEmail ──────────────────────────────────────────────────────

interface UseCreateDraftEmailState {
  created: GeneratedEmail | null;
  isLoading: boolean;
  error: string | null;
}

type CreateDraftEmailFn = (payload?: CreateDraftEmailPayload) => Promise<GeneratedEmail>;
type UseCreateDraftEmailReturn = [UseCreateDraftEmailState, CreateDraftEmailFn];

/**
 * Create a draft email without calling the LLM.
 */
export function useCreateDraftEmail(): UseCreateDraftEmailReturn {
  const [created, setCreated] = useState<GeneratedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraft = useCallback(
    async (payload?: CreateDraftEmailPayload): Promise<GeneratedEmail> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ExpertFinderService.createDraftEmail(payload ?? {});
        setCreated(response);
        return response;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create draft email';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return [{ created, isLoading, error }, createDraft];
}

// ── useUpdateGeneratedEmail ───────────────────────────────────────────────────

interface UseUpdateGeneratedEmailState {
  updated: GeneratedEmail | null;
  isLoading: boolean;
  error: string | null;
}

type UpdateGeneratedEmailFn = (
  emailId: number | string,
  payload: UpdateGeneratedEmailPayload
) => Promise<GeneratedEmail>;

type UseUpdateGeneratedEmailReturn = [UseUpdateGeneratedEmailState, UpdateGeneratedEmailFn];

/**
 * Update a generated email (e.g. mark as sent).
 */
export function useUpdateGeneratedEmail(): UseUpdateGeneratedEmailReturn {
  const [updated, setUpdated] = useState<GeneratedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEmail = useCallback(
    async (
      emailId: number | string,
      payload: UpdateGeneratedEmailPayload
    ): Promise<GeneratedEmail> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ExpertFinderService.updateEmail(emailId, payload);
        setUpdated(response);
        return response;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update email';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return [{ updated, isLoading, error }, updateEmail];
}

// ── useDeleteGeneratedEmail ─────────────────────────────────────────────────

interface UseDeleteGeneratedEmailState {
  isLoading: boolean;
  error: string | null;
}

type DeleteGeneratedEmailFn = (emailId: number | string) => Promise<void>;
type UseDeleteGeneratedEmailReturn = [UseDeleteGeneratedEmailState, DeleteGeneratedEmailFn];

/**
 * Delete a generated email.
 */
export function useDeleteGeneratedEmail(): UseDeleteGeneratedEmailReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEmail = useCallback(async (emailId: number | string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await ExpertFinderService.deleteEmail(emailId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete email';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ isLoading, error }, deleteEmail];
}

// ── useSavedTemplates ────────────────────────────────────────────────────────

interface UseSavedTemplatesState {
  templates: SavedTemplate[];
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

interface UseSavedTemplatesParams {
  limit?: number;
  offset?: number;
  immediate?: boolean;
}

type FetchSavedTemplatesFn = (params?: UseSavedTemplatesParams) => Promise<void>;
type UseSavedTemplatesReturn = [UseSavedTemplatesState, FetchSavedTemplatesFn];

/**
 * Lists saved templates with pagination.
 */
export function useSavedTemplates(params?: UseSavedTemplatesParams): UseSavedTemplatesReturn {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit,
    offset,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (fetchParams?: UseSavedTemplatesParams) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await ExpertFinderService.listTemplates(fetchParams ?? params);
        setTemplates(response.templates);
        setPagination({
          total: response.total,
          limit: response.limit,
          offset: response.offset,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch templates';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [params?.limit, params?.offset]
  );

  const immediate = params?.immediate !== false;
  useEffect(() => {
    if (immediate) fetch();
  }, [immediate, fetch]);

  return [{ templates, pagination, isLoading, error }, fetch];
}

// ── useSavedTemplateDetail ───────────────────────────────────────────────────

interface UseSavedTemplateDetailState {
  template: SavedTemplate | null;
  isLoading: boolean;
  error: string | null;
}

type FetchSavedTemplateDetailFn = () => Promise<void>;
type UseSavedTemplateDetailReturn = [UseSavedTemplateDetailState, FetchSavedTemplateDetailFn];

/**
 * Fetches a single saved template by id.
 */
export function useSavedTemplateDetail(
  templateId: number | string | null
): UseSavedTemplateDetailReturn {
  const [template, setTemplate] = useState<SavedTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (templateId == null) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await ExpertFinderService.getTemplate(templateId);
      setTemplate(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch template';
      setError(message);
      setTemplate(null);
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    if (templateId != null) {
      fetch();
    } else {
      setTemplate(null);
      setError(null);
    }
  }, [templateId, fetch]);

  return [{ template, isLoading, error }, fetch];
}

// ── useCreateSavedTemplate ───────────────────────────────────────────────────

interface UseCreateSavedTemplateState {
  created: SavedTemplate | null;
  isLoading: boolean;
  error: string | null;
}

type CreateSavedTemplateFn = (payload: CreateSavedTemplatePayload) => Promise<SavedTemplate>;

type UseCreateSavedTemplateReturn = [UseCreateSavedTemplateState, CreateSavedTemplateFn];

/**
 * Create a saved template.
 */
export function useCreateSavedTemplate(): UseCreateSavedTemplateReturn {
  const [created, setCreated] = useState<SavedTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTemplate = useCallback(
    async (payload: CreateSavedTemplatePayload): Promise<SavedTemplate> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ExpertFinderService.createTemplate(payload);
        setCreated(response);
        return response;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create template';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return [{ created, isLoading, error }, createTemplate];
}

// ── useUpdateSavedTemplate ────────────────────────────────────────────────────

interface UseUpdateSavedTemplateState {
  updated: SavedTemplate | null;
  isLoading: boolean;
  error: string | null;
}

type UpdateSavedTemplateFn = (
  templateId: number | string,
  payload: UpdateSavedTemplatePayload
) => Promise<SavedTemplate>;

type UseUpdateSavedTemplateReturn = [UseUpdateSavedTemplateState, UpdateSavedTemplateFn];

/**
 * Update a saved template.
 */
export function useUpdateSavedTemplate(): UseUpdateSavedTemplateReturn {
  const [updated, setUpdated] = useState<SavedTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTemplate = useCallback(
    async (
      templateId: number | string,
      payload: UpdateSavedTemplatePayload
    ): Promise<SavedTemplate> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ExpertFinderService.updateTemplate(templateId, payload);
        setUpdated(response);
        return response;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update template';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return [{ updated, isLoading, error }, updateTemplate];
}

// ── useDeleteSavedTemplate ────────────────────────────────────────────────────

interface UseDeleteSavedTemplateState {
  isLoading: boolean;
  error: string | null;
}

type DeleteSavedTemplateFn = (templateId: number | string) => Promise<void>;
type UseDeleteSavedTemplateReturn = [UseDeleteSavedTemplateState, DeleteSavedTemplateFn];

/**
 * Delete a saved template.
 */
export function useDeleteSavedTemplate(): UseDeleteSavedTemplateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTemplate = useCallback(async (templateId: number | string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await ExpertFinderService.deleteTemplate(templateId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete template';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ isLoading, error }, deleteTemplate];
}
