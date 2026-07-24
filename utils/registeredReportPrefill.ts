import type { JSONContent } from '@tiptap/core';

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function normalizeRegisteredReportId(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;

  const normalized = Number(value);
  return Number.isSafeInteger(normalized) && normalized > 0 ? normalized : null;
}

export function getRegisteredReportProposalIdFromDocument(document: unknown): number | null {
  if (!isRecord(document) || !isRecord(document.attrs)) return null;

  const prefill = document.attrs.registered_report_prefill;
  return isRecord(prefill) ? normalizeRegisteredReportId(prefill.proposal_id) : null;
}

export function mergeRegisteredReportPrefill(
  document: JSONContent,
  proposalId: unknown
): JSONContent {
  const normalizedProposalId = normalizeRegisteredReportId(proposalId);
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
