'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  CircleCheck,
  FileSearch2,
  Gauge,
  Info,
  ListChecks,
  Plus,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { MenuTrigger } from '@/components/ui/MenuTrigger';
import { BaseMenu, BaseMenuRadioGroup, BaseMenuRadioItem } from '@/components/ui/form/BaseMenu';
import { Input } from '@/components/ui/form/Input';
import { RadioGroup, type RadioOption } from '@/components/ui/form/RadioGroup';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { SectionHeader } from '@/components/Notebook/SectionHeader';
import { cn } from '@/utils/styles';
import { HowItWorksModal } from './HowItWorksModal';
import {
  extractRulesFromDocument,
  newRuleId,
  normalizeRuleText,
  RULE_TYPE_DESCRIPTIONS,
  RULE_TYPE_LABELS,
  RULE_TYPES,
  type AllocationPolicy,
  type AllocationRule,
  type AllocationRuleType,
} from './rules';

const POLICY_OPTIONS: (RadioOption & { value: AllocationPolicy })[] = [
  {
    value: 'SELF_MANAGED',
    label: 'Self-managed',
    icon: <User className="h-4 w-4 shrink-0" aria-hidden="true" />,
    description: 'You decide each award.',
  },
  {
    value: 'AI_ASSISTED',
    label: 'AI-assisted',
    icon: <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />,
    description: 'AI recommends, you approve.',
  },
];

/** What the chosen policy means for the funder, shown under the choice. */
const POLICY_NOTES: Record<AllocationPolicy, string> = {
  SELF_MANAGED: 'After the deadline, you review the proposals and decide how funds are allocated.',
  AI_ASSISTED:
    "After the deadline, you'll get a report with AI-recommended awards to review. Nothing is paid until you approve.",
};

/** The glyph that leads a rule's type, so a list can be scanned by shape. */
const RULE_TYPE_ICON: Record<AllocationRuleType, LucideIcon> = {
  requirement: CircleCheck,
  preference: ThumbsUp,
  limit: Gauge,
};

interface AllocationState {
  policy: AllocationPolicy;
  rules: AllocationRule[];
  suggestions: AllocationRule[];
  /** Whether the document has been scanned at least once for this note. */
  hasExtracted: boolean;
}

const EMPTY_STATE: AllocationState = {
  policy: 'SELF_MANAGED',
  rules: [],
  suggestions: [],
  hasExtracted: false,
};

// Until the API stores these, the draft lives in this browser, per note.
const storageKey = (noteId: string | number) => `notebook:ai-allocation:${noteId}`;

function readStoredState(noteId: string | number): AllocationState {
  try {
    const raw = window.localStorage.getItem(storageKey(noteId));
    return raw ? { ...EMPTY_STATE, ...JSON.parse(raw) } : EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

function writeStoredState(noteId: string | number, state: AllocationState) {
  try {
    window.localStorage.setItem(storageKey(noteId), JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, blocked); the draft then
    // lasts for this visit only.
  }
}

interface AiAllocationPanelProps {
  /** Whether the tab is showing; the document is first scanned when it is. */
  readonly active: boolean;
}

export function AiAllocationPanel({ active }: AiAllocationPanelProps) {
  const { activeNoteId, editor } = useNotebookContext();
  const [state, setState] = useState<AllocationState>(EMPTY_STATE);
  const [loadedNoteId, setLoadedNoteId] = useState<typeof activeNoteId | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftType, setDraftType] = useState<AllocationRuleType>('preference');
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const extractionSeqRef = useRef(0);

  useEffect(() => {
    if (!activeNoteId) return;
    extractionSeqRef.current++;
    setIsExtracting(false);
    setState(readStoredState(activeNoteId));
    setLoadedNoteId(activeNoteId);
  }, [activeNoteId]);

  const isLoaded = Boolean(activeNoteId) && loadedNoteId === activeNoteId;

  useEffect(() => {
    if (isLoaded && activeNoteId) writeStoredState(activeNoteId, state);
  }, [isLoaded, activeNoteId, state]);

  const extract = useCallback(async () => {
    const seq = ++extractionSeqRef.current;
    setIsExtracting(true);
    try {
      const found = await extractRulesFromDocument(editor);
      // A newer scan, or a different note, has taken over.
      if (seq !== extractionSeqRef.current) return;
      setState((prev) => {
        const kept = new Set(prev.rules.map((rule) => normalizeRuleText(rule.text)));
        return {
          ...prev,
          hasExtracted: true,
          suggestions: found.filter((rule) => !kept.has(normalizeRuleText(rule.text))),
        };
      });
    } finally {
      if (seq === extractionSeqRef.current) setIsExtracting(false);
    }
  }, [editor]);

  const isAiAssisted = state.policy === 'AI_ASSISTED';

  // The first time the funder lands on AI-assisted, read the RFP for them.
  useEffect(() => {
    if (!active || !isLoaded || !isAiAssisted || state.hasExtracted || !editor) return;
    void extract();
  }, [active, isLoaded, isAiAssisted, state.hasExtracted, editor, extract]);

  const acceptSuggestion = (id: string) => {
    const rule = state.suggestions.find((suggestion) => suggestion.id === id);
    if (!rule) return;
    setState((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter((suggestion) => suggestion.id !== id),
      rules: [...prev.rules, rule],
    }));
    toast.success('Rule added');
  };

  const acceptAllSuggestions = () => {
    const count = state.suggestions.length;
    setState((prev) => ({ ...prev, suggestions: [], rules: [...prev.rules, ...prev.suggestions] }));
    toast.success(`${count} rules added`);
  };

  const dismissSuggestion = (id: string) =>
    setState((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter((suggestion) => suggestion.id !== id),
    }));

  const removeRule = (id: string) =>
    setState((prev) => ({ ...prev, rules: prev.rules.filter((rule) => rule.id !== id) }));

  const setRuleType = (list: 'rules' | 'suggestions', id: string, type: AllocationRuleType) =>
    setState((prev) => ({
      ...prev,
      [list]: prev[list].map((rule) => (rule.id === id ? { ...rule, type } : rule)),
    }));

  const handleAddRule = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      setDraftError('Write the rule first.');
      return;
    }
    if (state.rules.some((rule) => normalizeRuleText(rule.text) === normalizeRuleText(text))) {
      setDraftError("That rule's already on the list.");
      return;
    }
    setState((prev) => ({
      ...prev,
      rules: [...prev.rules, { id: newRuleId(), text, type: draftType }],
    }));
    setDraft('');
    toast.success('Rule added');
  };

  if (!isLoaded) return null;

  return (
    <div data-testid="notebook-ai-allocation" className="rounded-lg bg-white shadow-md">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 lg:px-6">
        <SectionHeader icon={User}>Who decides funding?</SectionHeader>
        <RadioGroup
          options={POLICY_OPTIONS}
          value={state.policy}
          onChange={(next) => setState((prev) => ({ ...prev, policy: next as AllocationPolicy }))}
          size="sm"
          className="grid grid-cols-1 gap-2 space-y-0 sm:!grid-cols-2"
        />

        <p className="mt-3 flex items-start gap-1.5 text-sm text-gray-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          <span>
            {POLICY_NOTES[state.policy]}{' '}
            <Button
              type="button"
              variant="link"
              onClick={() => setIsHowItWorksOpen(true)}
              className="inline h-auto align-baseline text-sm font-medium"
            >
              How it works
            </Button>
          </span>
        </p>

        {isAiAssisted && (
          <>
            <section
              className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 pb-1 pt-3"
              aria-labelledby="ai-allocation-suggested"
            >
              <SectionHeader
                icon={FileSearch2}
                id="ai-allocation-suggested"
                action={
                  <>
                    {state.suggestions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={acceptAllSuggestions}
                      >
                        Add all
                      </Button>
                    )}
                    <LoadingButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void extract()}
                      isLoading={isExtracting}
                      loadingText="Scanning…"
                      className="gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Re-scan
                    </LoadingButton>
                  </>
                }
              >
                Suggested from your RFP
                <CountBadge count={state.suggestions.length} />
              </SectionHeader>
              {state.suggestions.length > 0 ? (
                <RuleList
                  rules={state.suggestions}
                  onTypeChange={(id, type) => setRuleType('suggestions', id, type)}
                  renderActions={(rule) => (
                    <>
                      <Button
                        type="button"
                        variant="outlined"
                        size="sm"
                        onClick={() => acceptSuggestion(rule.id)}
                        className="gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </Button>
                      <RemoveButton
                        label="Dismiss suggestion"
                        onClick={() => dismissSuggestion(rule.id)}
                      />
                    </>
                  )}
                />
              ) : (
                <p className="pb-3 text-sm text-gray-500">
                  {isExtracting
                    ? 'Reading your document…'
                    : 'Nothing to suggest yet. Eligibility, priorities and award limits you write into the RFP show up here.'}
                </p>
              )}
            </section>

            <section className="mt-8" aria-labelledby="ai-allocation-rules">
              <SectionHeader icon={ListChecks} id="ai-allocation-rules">
                Your rules
                <CountBadge count={state.rules.length} />
              </SectionHeader>
              <p className="-mt-1 mb-2 text-sm text-gray-600">
                AI checks every proposal against these rules when it recommends awards.
              </p>
              <RuleList
                rules={state.rules}
                onTypeChange={(id, type) => setRuleType('rules', id, type)}
                renderActions={(rule) => (
                  <RemoveButton label="Remove rule" onClick={() => removeRule(rule.id)} />
                )}
              />

              <form onSubmit={handleAddRule} className="mt-3 flex items-start gap-2">
                <Input
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setDraftError(null);
                  }}
                  aria-label="New rule"
                  placeholder="Favor teams with an early-career PI"
                  error={draftError ?? undefined}
                  wrapperClassName="min-w-0 flex-1"
                  className="h-10 [&_input]:text-sm"
                  rightElement={
                    <div className="flex items-center pr-2">
                      <RuleTypeMenu value={draftType} onChange={setDraftType} badge />
                    </div>
                  }
                />
                <Button type="submit" variant="outlined" className="shrink-0">
                  Add
                </Button>
              </form>
            </section>
          </>
        )}
      </div>

      <HowItWorksModal
        policy={state.policy}
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
}

function CountBadge({ count }: Readonly<{ count: number }>) {
  if (count === 0) return null;
  return (
    <Badge size="sm" className="ml-2 inline-flex align-middle">
      {count}
    </Badge>
  );
}

function RuleTypeGlyph({ type }: Readonly<{ type: AllocationRuleType }>) {
  const Icon = RULE_TYPE_ICON[type];
  return <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />;
}

function RuleTypeMenu({
  value,
  onChange,
  badge = false,
}: Readonly<{
  value: AllocationRuleType;
  onChange: (type: AllocationRuleType) => void;
  /** A quiet gray pill, for sitting inside the new-rule input. */
  badge?: boolean;
}>) {
  return (
    <BaseMenu
      align={badge ? 'end' : 'start'}
      className="min-w-[260px] rounded-xl p-1.5"
      trigger={
        <MenuTrigger
          srLabel="Rule type:"
          icon={<RuleTypeGlyph type={value} />}
          className={
            badge
              ? 'gap-1.5 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              : '-ml-1.5 gap-1.5'
          }
        >
          {RULE_TYPE_LABELS[value]}
        </MenuTrigger>
      }
    >
      <BaseMenuRadioGroup
        value={value}
        onValueChange={(next) => onChange(next as AllocationRuleType)}
      >
        {RULE_TYPES.map((type) => (
          <BaseMenuRadioItem key={type} value={type} className="items-start">
            <span className="-mt-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <RuleTypeGlyph type={type} />
                {RULE_TYPE_LABELS[type]}
              </span>
              <span className="block text-xs text-gray-500">{RULE_TYPE_DESCRIPTIONS[type]}</span>
            </span>
          </BaseMenuRadioItem>
        ))}
      </BaseMenuRadioGroup>
    </BaseMenu>
  );
}

/** The X at the end of a row: dismisses a suggestion, removes a rule. */
function RemoveButton({ label, onClick }: Readonly<{ label: string; onClick: () => void }>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      tooltip={label}
      onClick={onClick}
      className="h-8 w-8 text-gray-500"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}

function RuleList({
  rules,
  onTypeChange,
  renderActions,
}: Readonly<{
  rules: AllocationRule[];
  onTypeChange: (id: string, type: AllocationRuleType) => void;
  renderActions: (rule: AllocationRule) => React.ReactNode;
}>) {
  if (rules.length === 0) return null;
  return (
    <ul className="divide-y divide-gray-200/70">
      {rules.map((rule) => (
        <li key={rule.id} className="flex items-start gap-3 py-3">
          <div className="min-w-0 flex-1">
            <RuleTypeMenu value={rule.type} onChange={(type) => onTypeChange(rule.id, type)} />
            <p className="mt-0.5 text-sm text-gray-900">{rule.text}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">{renderActions(rule)}</div>
        </li>
      ))}
    </ul>
  );
}
