'use client';

import { ReactNode, useState } from 'react';
import './globals.css';
import 'cal-sans/index.css';
import 'katex/dist/katex.min.css';

import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import { PageLayout } from '@/app/layouts/PageLayout';
import { NotebookProvider } from '@/contexts/NotebookContext';
import { NoteEditorLayout } from '@/components/Notebook/NoteEditorLayout';

function NotebookContent({ children }: Readonly<{ children: ReactNode }>) {
  // The docked assistant already reserves its own gutter inside the page
  // container, so keeping the container capped would centre the document in
  // what's left and leave a wide dead band on either side. Release the cap for
  // as long as the panel is docked.
  const [isAgentChatDocked, setIsAgentChatDocked] = useState(false);

  // The shared layout's sidebar and TopBar are opaque white and the scroll
  // area is transparent, so wrapping in a gray surface turns just the content
  // canvas gray — no change needed to the shared PageLayout.
  return (
    <div className="bg-gray-50">
      <PageLayout rightSidebar={false} wideRow={isAgentChatDocked}>
        <NoteEditorLayout onAgentChatDockedChange={setIsAgentChatDocked} />
        {children}
      </PageLayout>
    </div>
  );
}

export default function NotebookClientLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <NotebookProvider>
      <NotebookContent>{children}</NotebookContent>
    </NotebookProvider>
  );
}
