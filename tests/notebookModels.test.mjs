// Run with: node --experimental-strip-types --test tests/notebookModels.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  availableThinkingModes,
  normalizeGenerationOptions,
  unknownModel,
} from '../types/notebookModels.ts';

const claude = {
  ref: 'claude_platform:claude-sonnet-4-6',
  provider: 'claude_platform',
  capabilities: {
    effort: ['low', 'medium', 'high', 'max'],
    thinking: ['adaptive', 'disabled'],
    temperature: true,
  },
};
const opus = {
  ...claude,
  ref: 'claude_platform:claude-opus-5',
  capabilities: { ...claude.capabilities, effort: ['low', 'high', 'xhigh', 'max'] },
};
const openrouter = {
  ...claude,
  ref: 'openrouter:openai/gpt-5.6-sol',
  provider: 'openrouter',
  capabilities: { ...claude.capabilities, effort: ['none', 'low', 'high', 'max'] },
};

test('first messages choose effort; follow-ups inherit it without changing the new-chat preference', () => {
  const preference = Object.freeze({ effort: 'high', thinking: 'adaptive' });
  assert.deepEqual(normalizeGenerationOptions(claude, preference), preference);
  const followUp = normalizeGenerationOptions(claude, preference, true);
  assert.deepEqual(followUp, { thinking: 'adaptive' });
  assert.equal(Object.hasOwn(followUp, 'effort'), false);
  assert.deepEqual(normalizeGenerationOptions(claude, preference, false), preference);
});

test('reopened and legacy chats never send browser effort, even when the recorded model is unknown', () => {
  for (const model of [claude, opus, openrouter, unknownModel('retired:model')]) {
    for (const effort of [undefined, 'none', 'low', 'high', 'max']) {
      const options = normalizeGenerationOptions(model, { effort }, true);
      assert.equal(Object.hasOwn(options, 'effort'), false);
    }
  }
});

test('independent thinking and temperature remain editable on existing chats', () => {
  assert.deepEqual(
    normalizeGenerationOptions(
      claude,
      { effort: 'high', thinking: 'disabled', temperature: 0.7 },
      true
    ),
    { thinking: 'disabled', temperature: 0.7 }
  );
  assert.deepEqual(availableThinkingModes(claude, true), ['adaptive', 'disabled']);
});

test('OpenRouter thinking flags cannot contradict an unknown inherited effort', () => {
  assert.deepEqual(availableThinkingModes(openrouter, true), []);
  for (const thinking of ['adaptive', 'disabled']) {
    assert.deepEqual(
      normalizeGenerationOptions(openrouter, { effort: 'high', thinking, temperature: 0.5 }, true),
      { temperature: 0.5 }
    );
  }
});

test('Opus thinking off and its dependent temperature are removed when saved effort could be max', () => {
  assert.deepEqual(availableThinkingModes(opus, true), ['adaptive']);
  assert.deepEqual(
    normalizeGenerationOptions(
      opus,
      { effort: 'low', thinking: 'disabled', temperature: 0.5 },
      true
    ),
    {}
  );
});

test('new OpenRouter chats explicitly choose no effort when thinking is off', () => {
  assert.deepEqual(normalizeGenerationOptions(openrouter, { thinking: 'disabled' }), {
    effort: 'none',
    thinking: 'disabled',
  });
  assert.deepEqual(availableThinkingModes(openrouter, false), ['adaptive', 'disabled']);
});

test('models without effort retain their independent controls', () => {
  const model = { ...claude, capabilities: { ...claude.capabilities, effort: [] } };
  assert.deepEqual(
    normalizeGenerationOptions(
      model,
      { effort: 'high', thinking: 'disabled', temperature: 1 },
      true
    ),
    { thinking: 'disabled', temperature: 1 }
  );
});
