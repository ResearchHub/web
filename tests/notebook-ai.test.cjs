/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS Node test runner. */
// Run with: node --test tests/notebook-ai.test.cjs
// Uses the repository's TypeScript compiler and Node's test runner; no extra test dependencies.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
const api = {};
function load(relative) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const compiledModule = { exports: {} };
  cache.set(filename, compiledModule);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const localRequire = (specifier) => {
    if (
      specifier === '@/services/client' ||
      (specifier === './client' && relative.startsWith('services/'))
    )
      return { ApiClient: api };
    if (specifier === '@/hooks/useAgentModels')
      return { useAgentModels: () => ({ status: 'ok', catalog }) };
    if (!specifier.startsWith('@/') && !specifier.startsWith('.')) return require(specifier);
    const base = specifier.startsWith('@/')
      ? path.join(root, specifier.slice(2))
      : path.resolve(path.dirname(filename), specifier);
    const target = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(existsSync);
    return load(path.relative(root, target));
  };
  new Function('require', 'module', 'exports', source)(
    localRequire,
    compiledModule,
    compiledModule.exports
  );
  return compiledModule.exports;
}
const budgetTypes = load('types/researchAI.ts');
const models = load('types/notebookModels.ts');
const { createResearchAIStore } = load('store/researchAI.ts');
const { ApiError } = load('services/types/api.ts');
const service = load('services/notebookChat.service.ts');
const { renderToStaticMarkup } = require('react-dom/server');
const { createElement } = require('react');
const { CreditMeter } = load('components/Notebook/AgentChat/CreditMeter.tsx');
const { ChatComposer } = load('components/Notebook/AgentChat/ChatComposer.tsx');
const { ModelControls } = load('components/Notebook/AgentChat/ModelControls.tsx');
const tomorrow = new Date();
tomorrow.setUTCHours(24, 0, 0, 0);
const budget = (overrides = {}) => ({
  tier: 'default',
  credits: { daily_limit: '250', used: '1.65', remaining: '248.35' },
  turns_used: 2,
  turn_cap: 10,
  resets_at: tomorrow.toISOString(),
  ...overrides,
});
const catalog = models.toAgentModelCatalog({
  default: 'openrouter:test',
  credit_pricing: {
    multiplier_base_model: 'openrouter:base',
    multiplier_basis: 'equal_input_output_tokens',
    multiplier_is_estimate: true,
  },
  models: [
    {
      ref: 'openrouter:test',
      label: 'Flash',
      allowed: true,
      multiplier: '0.03',
      capabilities: { effort: ['low', 'high'], thinking: [], temperature: false },
    },
    { ref: 'openrouter:base', label: 'Baseline', allowed: true, multiplier: '1' },
    { ref: 'openrouter:unpriced', allowed: false, multiplier: null },
  ],
});
const storeWith = (getBudget = async () => budget()) =>
  createResearchAIStore({ budget: getBudget, catalog: async () => catalog });
const flush = () => new Promise((resolve) => setImmediate(resolve));

test('credit exhaustion and provider-call cap are independent; null means unlimited', () => {
  assert.equal(budgetTypes.isBudgetExhausted(budget()), false);
  assert.equal(
    budgetTypes.isBudgetExhausted(
      budget({ credits: { daily_limit: '250', used: '250', remaining: '0.00' } })
    ),
    true
  );
  assert.equal(budgetTypes.isBudgetExhausted(budget({ turns_used: 10 })), true);
  assert.equal(
    budgetTypes.isBudgetExhausted(
      budget({
        credits: { daily_limit: null, used: '999', remaining: null },
        turn_cap: null,
        turns_used: 999,
      })
    ),
    false
  );
  assert.equal(budgetTypes.isResearchAIBudget({ tier: 'default', remaining: '100' }), false);
});

test('tiers and catalog permissions are authoritative; fractions are not rounded to zero', () => {
  assert.equal(budgetTypes.canSelectAIModel('default'), false);
  assert.equal(budgetTypes.canSelectAIModel('blocked'), false);
  assert.equal(budgetTypes.canSelectAIModel('invited'), true);
  assert.equal(budgetTypes.canSelectAIModel('privileged'), true);
  assert.equal(catalog.models[2].allowed, false);
  assert.equal(models.formatModelMultiplier('0.03'), '0.03×');
  assert.equal(models.formatModelMultiplier('3.75'), '3.75×');
  assert.equal(models.formatModelMultiplier('0.001'), '<0.01×');
  assert.equal(models.formatModelMultiplier(null), 'Pricing unavailable');
  assert.equal(budgetTypes.formatCredits('0.00010'), '0.00');
  assert.equal(budgetTypes.formatCredits('12345.6'), '12,345.60');
  assert.equal(budgetTypes.formatCredits('250'), '250.00');
  assert.match(models.modelMultiplierExplanation(catalog), /relative to Baseline/);
  assert.deepEqual(
    models.normalizeGenerationOptions(catalog.models[0], {
      effort: 'high',
      thinking: 'adaptive',
      temperature: 1,
    }),
    { effort: 'high' }
  );
});

test('meter shows fractional credits, daily cap exhaustion, local reset and unlimited balances', () => {
  const render = (b) =>
    renderToStaticMarkup(
      createElement(CreditMeter, {
        budget: b,
        budgetStatus: 'ok',
        limitResetAt: null,
        onRefresh() {},
      })
    );
  assert.match(render(budget()), /248.35 credits remaining/);
  assert.match(render(budget()), /250\.00 daily credits/);
  assert.match(render(budget()), /Resets at/);
  const capped = render(budget({ turns_used: 10 }));
  assert.match(capped, /Daily AI usage limit reached/);
  assert.doesNotMatch(capped, /Out of credits|messages remaining/);
  assert.match(
    render(budget({ credits: { daily_limit: null, remaining: null, used: '1' } })),
    /Unlimited credits/
  );
  const previousTZ = process.env.TZ;
  process.env.TZ = 'America/New_York';
  assert.match(budgetTypes.formatBudgetReset('2026-09-05T00:00:00Z'), /8:00/);
  if (previousTZ === undefined) delete process.env.TZ;
  else process.env.TZ = previousTZ;
});

test('exhaustion disables Send but retains editable draft and Stop', () => {
  const props = {
    value: 'Keep my unsent question',
    onChange() {},
    onSend() {},
    onStop() {},
    busy: false,
    canStop: false,
    disabled: false,
    sendDisabled: true,
    notice: null,
    textareaRef: { current: null },
  };
  const html = renderToStaticMarkup(createElement(ChatComposer, props));
  assert.match(html, /Keep my unsent question/);
  assert.doesNotMatch(html, /<textarea[^>]* disabled=""/);
  assert.match(html, /<button[^>]*disabled=""[^>]*title="Send message"/);
  const running = renderToStaticMarkup(
    createElement(ChatComposer, { ...props, busy: true, canStop: true })
  );
  assert.match(running, /title="Stop the assistant"/);
  assert.doesNotMatch(running, /<button[^>]* disabled=""/);
});

test('pinned model control is disabled and explains how to switch', () => {
  const html = renderToStaticMarkup(
    createElement(ModelControls, {
      models: catalog.models,
      model: catalog.models[0],
      pinned: true,
      options: {},
      onSelectModel() {},
      onChangeOptions() {},
      disabled: false,
      multiplierExplanation: models.modelMultiplierExplanation(catalog),
    })
  );
  assert.match(html, /<button[^>]*disabled=""/);
  assert.match(html, /Start a new chat to switch models/);
});

test('shared subscribers see one fetch; progress refreshes throttle and sessions stay isolated', async () => {
  let calls = 0;
  const store = storeWith(async () => {
    calls++;
    return budget();
  });
  const snapshots = [];
  const unsubscribe = store.subscribe(() => snapshots.push(store.getSnapshot()));
  await Promise.all([store.refreshBudget(), store.refreshBudget()]);
  await store.refreshBudget();
  assert.equal(calls, 1);
  assert.equal(snapshots.at(-1).budget.credits.remaining, '248.35');
  assert.equal(storeWith().getSnapshot().budget, null);
  unsubscribe();
});

test('429 budget wins over an older GET, with a follow-up refresh after settlement', async () => {
  let resolveOld;
  let calls = 0;
  const store = storeWith(() =>
    ++calls === 1
      ? new Promise((resolve) => {
          resolveOld = resolve;
        })
      : Promise.resolve(budget())
  );
  const pending = store.refreshBudget(true);
  store.recordLimit(budget({ turns_used: 10 }));
  assert.equal(store.getSnapshot().budget.turns_used, 10);
  resolveOld(budget());
  await pending;
  await flush();
  assert.equal(calls, 2);
  assert.equal(store.isSubmissionBlocked(), true);
});

test('a post-202 limit stays blocked with credits remaining and recovers after reset', async () => {
  let current = budget();
  const store = storeWith(async () => current);
  await store.refreshBudget();
  store.recordLimit();
  await flush();
  assert.equal(store.isSubmissionBlocked(), true);
  const nextReset = new Date(Date.parse(current.resets_at) + 86400000).toISOString();
  current = budget({ resets_at: nextReset, turns_used: 0 });
  await store.refreshBudget(true);
  assert.equal(store.isSubmissionBlocked(), false);
});

test('opening an old failed turn does not block today, and cancellation refresh never refunds', async () => {
  const store = storeWith();
  await store.refreshBudget();
  store.recordLimit(undefined, '2020-01-01T12:00:00Z');
  assert.equal(store.isSubmissionBlocked(), false);
  await store.refreshBudget(true);
  assert.equal(store.getSnapshot().budget.credits.remaining, '248.35');
});

test('budget failure keeps the recorded balance and catalog refresh removes withdrawn choices', async () => {
  let fail = false;
  let available = catalog;
  const store = createResearchAIStore({
    budget: async () => {
      if (fail) throw Error('offline');
      return budget();
    },
    catalog: async () => available,
  });
  await store.refreshBudget();
  fail = true;
  await store.refreshBudget(true);
  assert.equal(store.getSnapshot().budgetStatus, 'unavailable');
  assert.equal(store.getSnapshot().budget.credits.remaining, '248.35');
  await store.refreshCatalog();
  available = { ...catalog, models: [] };
  await store.refreshCatalog();
  assert.equal(store.getSnapshot().catalog.models.length, 0);
});

test('errors preserve structured codes, top-level budgets and ordinary field validation', () => {
  const limit = new ApiError('Request failed', 429, { ...budget(), code: 'usage_limit_exceeded' });
  assert.equal(service.chatErrorCode(limit), 'usage_limit_exceeded');
  assert.equal(service.chatErrorBody(limit).credits.remaining, '248.35');
  assert.equal(
    service.chatErrorDetail(new ApiError('Request failed', 400, { message: ['Too long.'] })),
    'message: Too long.'
  );
  assert.equal(
    service.chatErrorDetail(new ApiError('Request failed', 400, { detail: 'Model unavailable.' })),
    'Model unavailable.'
  );
  assert.equal(
    service.chatErrorCode(new ApiError('Request failed', 409, { code: 'usage_work_in_progress' })),
    'usage_work_in_progress'
  );
});

test('default-tier sends only message; selected model is omitted once the conversation is locked', async () => {
  const { useAgentModelSelection } = load('hooks/useAgentModelSelection.ts');
  let selection;
  function Probe(props) {
    selection = useAgentModelSelection({
      enabled: false,
      conversationKey: 'new',
      pinnedRef: null,
      locked: false,
      ...props,
    });
    return null;
  }
  let sent;
  api.post = async (url, body) => {
    sent = { url, body };
    return { execution_id: 42 };
  };
  renderToStaticMarkup(createElement(Probe, { canSelect: false }));
  await service.NotebookChatService.sendMessage(
    1,
    2,
    'Summarize this notebook.',
    selection.request
  );
  assert.deepEqual(sent.body, { message: 'Summarize this notebook.' });
  renderToStaticMarkup(createElement(Probe, { canSelect: true }));
  assert.equal(selection.model.ref, catalog.default);
  assert.equal(selection.request.model, catalog.default);
  renderToStaticMarkup(
    createElement(Probe, { canSelect: true, locked: true, pinnedRef: 'openrouter:base' })
  );
  assert.equal(selection.model.ref, 'openrouter:base');
  assert.equal(selection.request.model, undefined);
});

test('immediate resubmission after cancellation handles account-wide 409 without classifying it as exhaustion', async () => {
  api.post = async (url) => {
    if (url.endsWith('/cancel/')) return { cancelled: true, execution_id: 42 };
    throw new ApiError('Request failed', 409, { code: 'usage_work_in_progress' });
  };
  await service.NotebookChatService.cancelTurn(1, 2);
  await assert.rejects(
    service.NotebookChatService.sendMessage(1, 2, 'Preserved draft'),
    (error) => {
      const outcome = service.sendFailureOutcome(error);
      assert.equal(outcome.reason, 'account_busy');
      assert.equal(outcome.detail, 'Another AI request is still running.');
      return true;
    }
  );
  assert.equal(service.sendFailureOutcome(new ApiError('busy', 409)).reason, 'busy');
  assert.equal(service.sendFailureOutcome(new ApiError('forbidden', 403)).reason, 'unauthorized');
  assert.equal(
    service.sendFailureOutcome(
      new ApiError('invalid', 400, { code: 'model_not_allowed', detail: 'Choose another model.' })
    ).reason,
    'model_not_allowed'
  );
  assert.equal(
    service.sendFailureOutcome(new ApiError('invalid', 400, { message: ['Too long.'] })).reason,
    'invalid'
  );
  assert.equal(
    service.sendFailureOutcome(new ApiError('limit', 429, { code: 'usage_limit_exceeded' })).reason,
    'usage_limit'
  );
});
