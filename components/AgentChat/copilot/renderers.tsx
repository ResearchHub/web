'use client';

import type {
  ReactActivityMessageRenderer,
  ReactToolCallRenderer,
} from '@copilotkit/react-core/v2';
import { AlertCircle, Ban } from 'lucide-react';
import { z } from 'zod';
import { ActivityFeed, PendingThinkingRow } from '@/components/AgentChat/ActivityFeed';
import { RoutedModelNote } from '@/components/AgentChat/RoutedModelNote';
import type {
  ChatExecutionError,
  ChatToolCallActivity,
  ChatToolDraftActivity,
} from '@/types/agentChat';

/** Tool calls the model is still composing; the backend prefixes their ids. */
export function isPreviewId(id: string): boolean {
  return id.startsWith('preview-');
}

interface ToolCallProps {
  readonly name: string;
  readonly toolCallId: string;
  readonly args: Partial<{ label: string; detail: string; text: string }> | undefined;
  readonly status: 'inProgress' | 'executing' | 'complete';
  readonly result: string | undefined;
}

function parseResult(result: string | undefined): Partial<ChatToolCallActivity> | null {
  if (!result) return null;
  try {
    const parsed: unknown = JSON.parse(result);
    return parsed && typeof parsed === 'object' ? (parsed as Partial<ChatToolCallActivity>) : null;
  } catch {
    return null;
  }
}

/**
 * Every backend tool call, drawn as the activity row the chat has always used.
 *
 * The backend sends only public fields: a call's arguments are its `label`
 * and `detail`, and its result is the whole public activity item (status,
 * sources, the note version an edit produced, a code preview). A call still
 * being composed has the id prefix `preview-` and arguments `{label, text}`,
 * where `text` is the prose an edit is writing.
 */
function ToolCallRow({ name, toolCallId, args, status, result }: ToolCallProps) {
  if (isPreviewId(toolCallId)) {
    const draft: ChatToolDraftActivity & { id: string } = {
      id: toolCallId,
      type: 'tool_draft',
      tool: name,
      label: args?.label ?? '',
      text: args?.text ?? '',
      at: '',
    };
    return (
      <ActivityFeed
        items={[draft]}
        streamingItemId={status === 'complete' ? undefined : toolCallId}
      />
    );
  }
  const settled = parseResult(result);
  const call: ChatToolCallActivity = {
    type: 'tool_call',
    tool: name,
    label: args?.label ?? name,
    detail: args?.detail,
    status: 'in_progress',
    started_at: null,
    finished_at: null,
    ...settled,
  };
  return <ActivityFeed items={[call]} />;
}

export const TOOL_CALL_RENDERERS: ReactToolCallRenderer<unknown>[] = [
  { name: '*', render: ToolCallRow as ReactToolCallRenderer<unknown>['render'] },
];

const executionStatusSchema = z.object({
  execution_id: z.number(),
  status: z.string(),
  model: z.string().nullable().optional(),
  routed_model: z.string().nullable().optional(),
  phase: z.object({ label: z.string().optional() }).passthrough().nullable().optional(),
  error: z
    .object({ code: z.string().optional(), message: z.string().optional() })
    .passthrough()
    .nullable()
    .optional(),
});

type ExecutionStatus = z.infer<typeof executionStatusSchema>;

/**
 * A turn's status line: what a running turn is doing, why one failed, that it
 * was stopped, or which model answered when the requested one declined.
 */
function ExecutionStatusRow({ content }: { readonly content: ExecutionStatus }) {
  switch (content.status) {
    case 'pending':
    case 'running':
      return <PendingThinkingRow label={content.phase?.label ?? 'Thinking'} />;
    case 'cancelled':
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <Ban className="h-3.5 w-3.5" aria-hidden="true" />
          Stopped
        </div>
      );
    case 'failed':
    case 'interrupted': {
      const error = content.error as Partial<ChatExecutionError> | null | undefined;
      return (
        <div className="flex items-start gap-2 text-sm leading-relaxed text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error?.message ?? 'Something went wrong.'}</span>
        </div>
      );
    }
    default:
      return content.routed_model ? (
        <RoutedModelNote model={content.model ?? ''} routedModel={content.routed_model} />
      ) : null;
  }
}

export const ACTIVITY_RENDERERS: ReactActivityMessageRenderer<ExecutionStatus>[] = [
  { activityType: 'execution', content: executionStatusSchema, render: ExecutionStatusRow },
];
