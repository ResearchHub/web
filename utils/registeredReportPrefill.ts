import type { JSONContent } from '@tiptap/core';

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function mergeRegisteredReportPrefill(
  document: JSONContent,
  proposalId?: number | null
): JSONContent {
  if (proposalId == null) return document;

  const attrs = isRecord(document.attrs) ? document.attrs : {};
  const prefill = isRecord(attrs.registered_report_prefill) ? attrs.registered_report_prefill : {};

  return {
    ...document,
    attrs: {
      ...attrs,
      registered_report_prefill: {
        ...prefill,
        proposal_id: proposalId,
      },
    },
  };
}
