'use client';

import { ReactNode, useEffect } from 'react';
import './globals.css';
import 'cal-sans';
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
import { clearPendingGrant } from '@/components/Editor/lib/utils/publishingFormStorage';

function NotebookContent({ children }: Readonly<{ children: ReactNode }>) {
  useEffect(() => () => clearPendingGrant(), []);

  // The shared layout's sidebar and TopBar are opaque white and the scroll
  // area is transparent, so wrapping in a gray surface turns just the content
  // canvas gray — no change needed to the shared PageLayout.
  return (
    <div className="bg-gray-50">
      <PageLayout rightSidebar={false} wideContent>
        <NoteEditorLayout />
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
