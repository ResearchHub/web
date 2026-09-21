import type { Editor } from '@tiptap/core';
import grantTemplate from '@/components/Editor/lib/data/grantTemplate';
import { SAMPLE_SUGGESTIONS } from './fixtures';

/**
 * - requirement: a pass/fail gate on a proposal (eligibility).
 * - preference: a soft criterion that moves a proposal up or down the ranking.
 * - limit: a constraint on the money itself (caps, floors, number of awards).
 */
export type AllocationRuleType = 'requirement' | 'preference' | 'limit';

export type AllocationPolicy = 'SELF_MANAGED' | 'AI_ASSISTED';

export interface AllocationRule {
  id: string;
  text: string;
  type: AllocationRuleType;
}

export const RULE_TYPE_LABELS: Record<AllocationRuleType, string> = {
  requirement: 'Requirement',
  preference: 'Preference',
  limit: 'Limit',
};

/** What each type does to a proposal, for the funder choosing between them. */
export const RULE_TYPE_DESCRIPTIONS: Record<AllocationRuleType, string> = {
  requirement: 'Pass or fail: proposals that miss it are out.',
  preference: 'Moves a proposal up or down the ranking.',
  limit: 'Caps or floors on the money itself.',
};

export const RULE_TYPES = Object.keys(RULE_TYPE_LABELS) as AllocationRuleType[];

const MAX_SUGGESTIONS = 8;
const MIN_SENTENCE_LENGTH = 25;
const MAX_SENTENCE_LENGTH = 220;

// Checked in order: a sentence about money is a limit even when it says "must".
const TYPE_PATTERNS: [AllocationRuleType, RegExp][] = [
  [
    'limit',
    /[$€£]\s?\d|\b(up to|no more than|at most|at least|maximum|minimum|cap(ped)?|per (award|proposal|project|applicant))\b/i,
  ],
  ['requirement', /\b(must|shall|required?|requires|eligib\w*|only|mandatory|may not|cannot)\b/i],
  [
    'preference',
    /\b(prefer\w*|priorit\w*|favou?r\w*|encourag\w*|ideal\w*|strong\w* (consider|encourag)\w*|we value|bonus|should)\b/i,
  ],
];

const classify = (sentence: string): AllocationRuleType | null =>
  TYPE_PATTERNS.find(([, pattern]) => pattern.test(sentence))?.[0] ?? null;

const splitSentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(
      (sentence) => sentence.length >= MIN_SENTENCE_LENGTH && sentence.length <= MAX_SENTENCE_LENGTH
    );

export const normalizeRuleText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

type TemplateNode = { text?: string; content?: TemplateNode[] };

const collectText = (node: TemplateNode): string[] => [
  ...(node.text ? [node.text] : []),
  ...(node.content ?? []).flatMap(collectText),
];

/** Every sentence of the unedited RFP template, normalized. */
const TEMPLATE_SENTENCES = new Set(
  collectText(grantTemplate as TemplateNode)
    .flatMap((text) => text.split(/(?<=[.!?])\s+/))
    .map((text) => normalizeRuleText(text))
);

/**
 * Template scaffolding the funder hasn't replaced yet: a `[Insert …]` blank,
 * or one of the template's own writing prompts left as it came.
 */
const isTemplateBoilerplate = (sentence: string): boolean =>
  /\[[^\]]+\]/.test(sentence) || TEMPLATE_SENTENCES.has(normalizeRuleText(sentence));

let ruleSeq = 0;
export const newRuleId = (): string => `rule-${Date.now().toString(36)}-${++ruleSeq}`;

/**
 * Suggests allocation rules from the RFP document.
 *
 * Placeholder for the extraction endpoint: it scans the live document for
 * sentences phrased as gates, preferences or funding limits, so the tab works
 * on real content before the API exists. Async so the call site won't change
 * when the request replaces it.
 */
export async function extractRulesFromDocument(editor: Editor | null): Promise<AllocationRule[]> {
  if (!editor || editor.isDestroyed) return [];

  const suggestions: AllocationRule[] = [];
  const seen = new Set<string>();

  editor.state.doc.descendants((node) => {
    if (node.type.name === 'heading') return false;
    if (!node.isTextblock) return true;

    for (const sentence of splitSentences(node.textContent)) {
      const type = classify(sentence);
      const key = normalizeRuleText(sentence);
      if (!type || seen.has(key) || isTemplateBoilerplate(sentence)) continue;
      seen.add(key);
      suggestions.push({ id: newRuleId(), text: sentence, type });
    }
    return false;
  });

  // Until the endpoint exists, what the document yields is topped up with the
  // sample set, so the tab always opens on something to approve or reject.
  for (const sample of SAMPLE_SUGGESTIONS) {
    const key = normalizeRuleText(sample.text);
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(sample);
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
