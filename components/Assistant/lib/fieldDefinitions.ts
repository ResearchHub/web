import type { AssistantRole, FieldDefinition, FieldUpdate } from '@/types/assistant';

// ── Proposal fields (researcher path) ───────────────────────────────────────
// Progress bar tracks submission readiness — NOT document sections.
// Document content (description) is managed through the editor and AI conversation.

export const PROPOSAL_REQUIRED_FIELDS: FieldDefinition[] = [
  { key: 'title', label: 'Title', required: true },
  { key: 'authors', label: 'Authors', required: true },
  { key: 'hubs', label: 'Topics', required: true },
];

export const PROPOSAL_OPTIONAL_FIELDS: FieldDefinition[] = [];

// ── Funding opportunity fields (funder path) ────────────────────────────────
// Maps to: PostService.upsert({ document_type: 'GRANT', ... }) + GrantService.createGrant()
// Note: grant_currency is always 'USD', assign_doi is always true — set behind the scenes

export const FUNDING_REQUIRED_FIELDS: FieldDefinition[] = [
  { key: 'title', label: 'Title', required: true },
  { key: 'grant_amount', label: 'Budget', required: true },
  { key: 'grant_end_date', label: 'Deadline', required: true },
  { key: 'hubs', label: 'Topics', required: true },
  { key: 'grant_organization', label: 'Organization', required: true },
  { key: 'grant_contacts', label: 'Contact', required: true },
];

export const FUNDING_OPTIONAL_FIELDS: FieldDefinition[] = [];

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getFieldsForRole(role: AssistantRole): {
  required: FieldDefinition[];
  optional: FieldDefinition[];
  all: FieldDefinition[];
} {
  if (role === 'funder') {
    return {
      required: FUNDING_REQUIRED_FIELDS,
      optional: FUNDING_OPTIONAL_FIELDS,
      all: [...FUNDING_REQUIRED_FIELDS, ...FUNDING_OPTIONAL_FIELDS],
    };
  }

  return {
    required: PROPOSAL_REQUIRED_FIELDS,
    optional: PROPOSAL_OPTIONAL_FIELDS,
    all: [...PROPOSAL_REQUIRED_FIELDS, ...PROPOSAL_OPTIONAL_FIELDS],
  };
}

export function getInitialFieldState(role: AssistantRole): Record<string, FieldUpdate> {
  const { all } = getFieldsForRole(role);
  const state: Record<string, FieldUpdate> = {};
  for (const field of all) {
    state[field.key] = { status: 'empty', value: '' };
  }
  return state;
}

export function countCompleted(
  fieldState: Record<string, FieldUpdate>,
  requiredFields: FieldDefinition[]
): { completed: number; total: number } {
  let completed = 0;
  for (const field of requiredFields) {
    const state = fieldState[field.key];
    if (state && state.status === 'complete') {
      completed++;
    }
  }
  return { completed, total: requiredFields.length };
}
