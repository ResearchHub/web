import type { SendOutcome } from '@/services/notebookChat.service';
import { formatBudgetReset } from '@/types/researchAI';
import type { ComposerNotice } from './ChatComposer';

export type FailedSend = Extract<SendOutcome, { ok: false }>;

/** How a surface words its notices and who shows a spent budget. */
export interface ChatNoticePolicy {
  /** What the surface calls a chat: "conversation" in the workspace, "chat" in the notebook. */
  readonly noun: 'conversation' | 'chat';
  /**
   * A spent budget is announced by the composer notice, or left to a meter
   * rendered beside the composer that already says so.
   */
  readonly usageLimit: 'inline' | 'meter';
}

/** The spent-budget notice, naming the reset time when it is known. */
export function budgetSpentNotice(budgetResetsAt: string | null): ComposerNotice {
  return {
    tone: 'warning',
    text: budgetResetsAt
      ? `You’ve used today’s assistant budget. It resets at ${formatBudgetReset(budgetResetsAt)}.`
      : 'You’ve used today’s assistant budget. Try again after it resets.',
  };
}

/** A budget notice that went out before the reset time was known. */
export function isBudgetNoticeWithoutReset(notice: ComposerNotice | null): boolean {
  return (
    notice?.tone === 'warning' &&
    notice.text.includes('budget') &&
    !notice.text.includes('resets at')
  );
}

/**
 * Composer copy for a failed send. Server `detail` is rendered verbatim
 * wherever it exists; the fallbacks only cover bodies without one.
 */
export function noticeFromOutcome(
  outcome: FailedSend,
  policy: ChatNoticePolicy,
  budgetResetsAt: string | null
): ComposerNotice | null {
  switch (outcome.reason) {
    case 'account_busy':
      return {
        tone: 'warning',
        text:
          outcome.detail ??
          'Another assistant task of yours is still running elsewhere. Wait for it to finish, then try again.',
      };
    case 'busy':
      return {
        tone: 'warning',
        text: outcome.detail ?? 'The assistant is still working on a previous message.',
      };
    case 'usage_limit':
      if (policy.usageLimit === 'meter') return null;
      return budgetResetsAt
        ? budgetSpentNotice(budgetResetsAt)
        : { tone: 'warning', text: outcome.detail ?? budgetSpentNotice(null).text };
    case 'model_not_allowed':
      return {
        tone: 'error',
        text:
          outcome.detail ?? 'That model isn’t available to you. Pick another one and try again.',
      };
    case 'invalid':
      return { tone: 'error', text: outcome.detail ?? 'That message can’t be sent.' };
    case 'not_found':
      return { tone: 'error', text: `This ${policy.noun} is no longer available.` };
    case 'unauthorized':
      return {
        tone: 'error',
        text: outcome.detail ?? 'You don’t have access to the assistant.',
      };
    default:
      return {
        tone: 'error',
        text: outcome.detail ?? 'Something went wrong — your message wasn’t sent.',
      };
  }
}
