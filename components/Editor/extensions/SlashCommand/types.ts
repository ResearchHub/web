import { Editor } from '@tiptap/core';

import { icons } from 'lucide-react';

export interface Group {
  name: string;
  title: string;
  commands: Command[];
}

export interface Command {
  name: string;
  label: string;
  description: string;
  aliases?: string[];
  iconName: keyof typeof icons;
  /**
   * Run by the slash-command picker and the `+` insert button — inserts a
   * new node at the cursor or replaces an empty paragraph. Always defined.
   */
  action: (editor: Editor) => void;
  convertAction?: (editor: Editor) => void;
  shouldBeHidden?: (editor: Editor) => boolean;
  /**
   * Optional. Hide this command from the "Turn into" submenu specifically.
   * Use for items where a block-level conversion makes no semantic sense
   * (e.g. inline math is inline-level, not a block).
   */
  hideFromTurnInto?: boolean;
}

export interface MenuListProps {
  editor: Editor;
  items: Group[];
  command: (command: Command) => void;
}
