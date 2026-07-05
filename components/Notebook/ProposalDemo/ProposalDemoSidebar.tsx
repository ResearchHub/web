'use client';

import { ChatPanel } from './ChatPanel';

// Desktop-only chat panel for the proposal demo, docked against the right edge
// of the viewport (Cursor-style) rather than floating beside the document.
// The TopBar is 70px tall, so we start just below it and run to the bottom.
export function ProposalDemoSidebar() {
  return (
    <aside className="fixed right-0 top-[70px] bottom-0 z-30 hidden w-[440px] flex-col bg-white lg:flex">
      <ChatPanel />
    </aside>
  );
}
