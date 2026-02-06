import type { AssistantRole, FieldDefinition, FieldUpdate } from '@/types/assistant';

// ── Proposal fields (researcher path) ───────────────────────────────────────

export const PROPOSAL_REQUIRED_FIELDS: FieldDefinition[] = [
  {
    key: 'title',
    label: 'Title',
    required: true,
    inputMethod: 'Bot drafts from conversation, user confirms/edits',
  },
  {
    key: 'description',
    label: 'Description',
    required: true,
    inputMethod: 'Bot drafts from conversation, user confirms/edits',
  },
  {
    key: 'authors',
    label: 'Authors',
    required: true,
    inputMethod: 'Inline autocomplete component',
  },
  {
    key: 'topics',
    label: 'Topics / Hubs',
    required: true,
    inputMethod: 'Inline chip selector',
  },
  {
    key: 'funding_amount_rsc',
    label: 'Funding Amount (RSC)',
    required: true,
    inputMethod: 'Quick reply presets + custom input',
  },
  {
    key: 'deadline',
    label: 'Deadline',
    required: true,
    inputMethod: 'Quick reply presets + custom input',
  },
];

export const PROPOSAL_OPTIONAL_FIELDS: FieldDefinition[] = [
  {
    key: 'nonprofit',
    label: 'Non-profit Entity',
    required: false,
    inputMethod: 'Yes/No quick reply → autocomplete',
  },
  {
    key: 'milestones',
    label: 'Milestones',
    required: false,
    inputMethod: 'Conversational (bot helps structure)',
  },
  {
    key: 'attachments',
    label: 'Attachments',
    required: false,
    inputMethod: 'File upload component',
  },
];

// ── Funding opportunity fields (funder path) ────────────────────────────────

export const FUNDING_REQUIRED_FIELDS: FieldDefinition[] = [
  {
    key: 'title',
    label: 'Title',
    required: true,
    inputMethod: 'Bot drafts from conversation, user confirms/edits',
  },
  {
    key: 'description',
    label: 'Description',
    required: true,
    inputMethod: 'Bot drafts from conversation, user confirms/edits',
  },
  {
    key: 'topics',
    label: 'Topics / Hubs',
    required: true,
    inputMethod: 'Inline chip selector',
  },
  {
    key: 'funding_amount_rsc',
    label: 'Budget (RSC)',
    required: true,
    inputMethod: 'Quick reply presets + custom input',
  },
  {
    key: 'deadline',
    label: 'Submission Deadline',
    required: true,
    inputMethod: 'Quick reply presets + custom input',
  },
];

export const FUNDING_OPTIONAL_FIELDS: FieldDefinition[] = [
  {
    key: 'evaluation_criteria',
    label: 'Evaluation Criteria',
    required: false,
    inputMethod: 'Conversational',
  },
  {
    key: 'attachments',
    label: 'Attachments',
    required: false,
    inputMethod: 'File upload component',
  },
];

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
    if (state && (state.status === 'complete' || state.status === 'skipped')) {
      completed++;
    }
  }
  return { completed, total: requiredFields.length };
}
