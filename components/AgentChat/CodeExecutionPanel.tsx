'use client';

import { useId, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ChatCodeExecution } from '@/types/agentChat';

function previewLabel(hasCode: boolean, hasOutput: boolean): string {
  if (hasCode && hasOutput) return 'Code and output';
  if (hasCode) return 'Code';
  if (hasOutput) return 'Output';
  return 'Execution details';
}

function TextPreview({
  label,
  text,
  truncated,
}: {
  readonly label: string;
  readonly text: string;
  readonly truncated?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-gray-600">{label}</p>
      {/* Treat code and stdout as literal text, including HTML and Markdown. */}
      <pre
        // Keyboard scrolling needs explicit focusability in browsers such as Safari.
        tabIndex={0}
        role="region"
        aria-label={label}
        className="max-h-64 overflow-auto whitespace-pre rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <code>{text}</code>
      </pre>
      {truncated && <p className="mt-1 text-xs text-gray-500">{label} preview truncated.</p>}
    </div>
  );
}

/** A compact disclosure shared by live and historical activity on both chat surfaces. */
export function CodeExecutionPanel({
  execution,
  tool,
}: {
  readonly execution: ChatCodeExecution;
  readonly tool: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const hasCode = Boolean(execution.code);
  const hasOutput = Boolean(execution.output);
  const hasReturnCode = execution.return_code != null;
  const hasOutputCount = execution.output_count != null;

  if (!hasCode && !hasOutput && !hasReturnCode && !hasOutputCount) return null;

  const label = previewLabel(hasCode, hasOutput);

  return (
    <div className="mt-2">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 rounded py-1 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}
        {label}
      </button>
      <div id={panelId} hidden={!expanded} className="mt-2 min-w-0 space-y-3">
        {hasCode && (
          <TextPreview
            label={tool === 'bash_code_execution' ? 'Command' : 'Code'}
            text={execution.code!}
            truncated={execution.code_truncated}
          />
        )}
        {hasOutput && (
          <TextPreview
            label="Output"
            text={execution.output!}
            truncated={execution.output_truncated}
          />
        )}
        {(hasReturnCode || hasOutputCount) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            {hasReturnCode && <span>Exit code: {execution.return_code}</span>}
            {hasOutputCount && (
              <span>
                {execution.output_count} output {execution.output_count === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
