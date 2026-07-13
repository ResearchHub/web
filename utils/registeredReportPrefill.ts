import type { JSONContent } from '@tiptap/core';

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Returns a valid source-proposal post ID, or null for malformed values. */
export function normalizeRegisteredReportProposalId(value: unknown): number | null {
  const normalized =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;

  return Number.isSafeInteger(normalized) && normalized > 0 ? normalized : null;
}

/** Reads the source-proposal post ID stored in a TipTap document's root attrs. */
export function getRegisteredReportProposalIdFromDocument(document: unknown): number | null {
  if (!isRecord(document) || !isRecord(document.attrs)) return null;

  const prefill = document.attrs.registered_report_prefill;
  return isRecord(prefill) ? normalizeRegisteredReportProposalId(prefill.proposal_id) : null;
}

/**
 * Preserves the source-proposal binding that TipTap's root document schema
 * otherwise omits when serializing editor JSON.
 */
export function mergeRegisteredReportPrefill(
  document: JSONContent,
  proposalId: unknown
): JSONContent {
  const normalizedProposalId = normalizeRegisteredReportProposalId(proposalId);
  if (!normalizedProposalId) return document;

  const attrs = isRecord(document.attrs) ? document.attrs : {};
  const prefill = isRecord(attrs.registered_report_prefill) ? attrs.registered_report_prefill : {};

  return {
    ...document,
    attrs: {
      ...attrs,
      registered_report_prefill: {
        ...prefill,
        proposal_id: normalizedProposalId,
      },
    },
  };
}
