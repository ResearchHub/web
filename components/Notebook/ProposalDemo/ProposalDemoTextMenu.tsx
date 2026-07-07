'use client';

import { useEffect, useRef, useState } from 'react';
import { BubbleMenu, Editor, posToDOMRect } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { ArrowUp, MessageSquarePlus, Sparkles } from 'lucide-react';
import { Icon } from '@/components/Editor/components/ui/Icon';
import { Toolbar } from '@/components/Editor/components/ui/Toolbar';
import { Surface } from '@/components/Editor/components/ui/Surface';
import { useTextmenuCommands } from '@/components/Editor/components/menus/TextMenu/hooks/useTextmenuCommands';
import { useTextmenuStates } from '@/components/Editor/components/menus/TextMenu/hooks/useTextmenuStates';
import { isTextSelected } from '@/components/Editor/lib/utils';
import { applyDocEdits, applyRewrite } from './suggestedEdits';
import { REWRITE_COMMANDS, REWRITE_DEFAULT_RESULT, REWRITE_PRESETS } from './mockData';

type Mode = 'actions' | 'rewrite';

// Matches a free-typed rewrite instruction against the scripted rewrite
// commands. A command fires when the instruction contains a trigger phrase.
function matchRewriteCommand(instruction: string) {
  const normalized = instruction.toLowerCase();
  return REWRITE_COMMANDS.find((cmd) => cmd.triggers.some((t) => normalized.includes(t)));
}

/**
 * AI-first selection toolbar for the proposal demo. Leads with a "Rewrite"
 * action that morphs the toolbar into an instruction input (with one-click
 * presets); submitting streams a Google-Docs-suggesting-mode edit into the
 * selected range. Formatting controls are demoted into a "Format" overflow.
 */
export function ProposalDemoTextMenu({ editor }: { editor: Editor }) {
  const commands = useTextmenuCommands(editor);
  const states = useTextmenuStates(editor);

  const [mode, setMode] = useState<Mode>('actions');
  const [instruction, setInstruction] = useState('');
  // Selection range captured the moment Rewrite is clicked, before focus moves
  // to the input (ProseMirror keeps the selection, but we pin the range so the
  // edit targets exactly what was highlighted).
  const selectionRef = useRef<{ from: number; to: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'rewrite') inputRef.current?.focus();
  }, [mode]);

  const enterRewrite = () => {
    const { from, to } = editor.state.selection;
    if (from === to) return;
    selectionRef.current = { from, to };
    setMode('rewrite');
  };

  const cancel = () => {
    setMode('actions');
    setInstruction('');
  };

  // A preset chip: wholesale strike-and-replace of the whole selection.
  const applyPreset = (resultText: string) => {
    const range = selectionRef.current;
    if (!range) return;
    setMode('actions');
    setInstruction('');
    applyRewrite(editor, range.from, range.to, resultText);
  };

  // A free-typed instruction: a matching scripted command applies its
  // fine-grained edits; otherwise fall back to a wholesale rewrite.
  const submitInstruction = () => {
    const range = selectionRef.current;
    if (!range) return;
    const command = matchRewriteCommand(instruction);
    setMode('actions');
    setInstruction('');
    if (command) {
      void applyDocEdits(editor, command.edits);
      return;
    }
    applyRewrite(editor, range.from, range.to, REWRITE_DEFAULT_RESULT);
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="proposalDemoTextMenu"
      updateDelay={200}
      shouldShow={() => isTextSelected({ editor })}
      tippyOptions={{
        // Anchor to the caret at the end of the selection (Cursor-style)
        // instead of the whole selection rect, so the menu appears where the
        // user finished selecting rather than at the start.
        getReferenceClientRect: () => {
          const { to } = editor.state.selection;
          return posToDOMRect(editor.view, to, to);
        },
        popperOptions: {
          placement: 'bottom-start',
          modifiers: [
            { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
            { name: 'flip', enabled: false },
          ],
          strategy: 'fixed',
        },
        offset: [0, 8],
        maxWidth: 'calc(100vw - 16px)',
        interactive: true,
        // Keep the menu open while the user types the rewrite instruction.
        onHidden: () => cancel(),
      }}
    >
      {mode === 'actions' ? (
        <Toolbar.Wrapper className="!border-gray-200">
          <button
            type="button"
            onClick={enterRewrite}
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
          >
            <Sparkles className="h-4 w-4" />
            Rewrite
          </button>
          {/* Placeholder for the upcoming selection-to-chat flow — inert for now. */}
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Add to chat
          </button>
          <Toolbar.Divider />
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="flex h-8 items-center gap-1 rounded-md px-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Format
                <Icon name="ChevronDown" className="h-3 w-3" />
              </button>
            </Popover.Trigger>
            <Popover.Content side="top" sideOffset={8} asChild>
              <Toolbar.Wrapper className="!border-gray-200">
                <Toolbar.Button
                  tooltip="Bold"
                  tooltipShortcut={['Mod', 'B']}
                  onClick={commands.onBold}
                  active={states.isBold}
                >
                  <Icon name="Bold" />
                </Toolbar.Button>
                <Toolbar.Button
                  tooltip="Italic"
                  tooltipShortcut={['Mod', 'I']}
                  onClick={commands.onItalic}
                  active={states.isItalic}
                >
                  <Icon name="Italic" />
                </Toolbar.Button>
                <Toolbar.Button
                  tooltip="Underline"
                  tooltipShortcut={['Mod', 'U']}
                  onClick={commands.onUnderline}
                  active={states.isUnderline}
                >
                  <Icon name="Underline" />
                </Toolbar.Button>
                <Toolbar.Button
                  tooltip="Strikethrough"
                  tooltipShortcut={['Mod', 'Shift', 'S']}
                  onClick={commands.onStrike}
                  active={states.isStrike}
                >
                  <Icon name="Strikethrough" />
                </Toolbar.Button>
              </Toolbar.Wrapper>
            </Popover.Content>
          </Popover.Root>
        </Toolbar.Wrapper>
      ) : (
        <Surface className="w-[360px] p-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-2.5 py-1.5 focus-within:border-primary-400">
            <Sparkles className="h-4 w-4 shrink-0 text-primary-500" />
            <input
              ref={inputRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitInstruction();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancel();
                }
              }}
              placeholder="Describe the change…"
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={submitInstruction}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-600 text-white transition-colors hover:bg-primary-700"
              aria-label="Rewrite selection"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REWRITE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.result)}
                className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Surface>
      )}
    </BubbleMenu>
  );
}
