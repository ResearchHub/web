import { createTransformer, type BaseTransformed } from './transformer';

export type ReviewStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type OverallRating = 'excellent' | 'good' | 'poor';

export type KeyInsightItemType = 'strength' | 'weakness';

export interface KeyInsightItem {
  id: number;
  order: number;
  itemType: KeyInsightItemType;
  label: string;
  description: string;
}

export interface KeyInsightData {
  tldr: string;
  items: KeyInsightItem[];
}

type ProposalReviewFields = {
  status: ReviewStatus;
  overallRating: OverallRating | null;
  keyInsight: KeyInsightData | null;
};

export type ProposalReview = ProposalReviewFields & BaseTransformed<any>;

// ── Helpers ─────────────────────────────────────────────────────────────────

function numOrNull(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function transformKeyInsightItemRow(raw: Record<string, unknown>): KeyInsightItem | null {
  const itemTypeRaw = raw.item_type;
  if (itemTypeRaw !== 'strength' && itemTypeRaw !== 'weakness') return null;
  return {
    id: numOrNull(raw.id) ?? 0,
    order: numOrNull(raw.order) ?? 0,
    itemType: itemTypeRaw,
    label: str(raw.label),
    description: str(raw.description),
  };
}

export function transformKeyInsight(raw: unknown): KeyInsightData | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(o.items) ? o.items : [];
  const items: KeyInsightItem[] = [];
  for (const row of itemsRaw) {
    if (row && typeof row === 'object') {
      const it = transformKeyInsightItemRow(row as Record<string, unknown>);
      if (it) items.push(it);
    }
  }
  items.sort((a, b) => a.order - b.order || a.id - b.id);
  const tldr = str(o.tldr);
  if (items.length === 0 && !tldr) return null;

  return { tldr, items };
}

const reviewStatuses: ReviewStatus[] = ['pending', 'processing', 'completed', 'failed'];

function parseReviewStatus(v: unknown): ReviewStatus {
  return reviewStatuses.includes(v as ReviewStatus) ? (v as ReviewStatus) : 'pending';
}

function parseOverallRating(v: unknown): OverallRating | null {
  if (v == null || v === '') return null;
  const r = String(v).toLowerCase() as OverallRating;
  return ['excellent', 'good', 'poor'].includes(r) ? r : null;
}

export const transformProposalReview = createTransformer<any, ProposalReviewFields>((raw) => ({
  status: parseReviewStatus(raw.status),
  overallRating: parseOverallRating(raw.overall_rating),
  keyInsight: transformKeyInsight(raw.key_insight),
}));
