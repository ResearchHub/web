'use client';

import { ReactNode, useEffect } from 'react';
import './globals.css';
import 'cal-sans';
import 'katex/dist/katex.min.css';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ChevronLeft } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/Button';

// Import font styles
import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { LeftSidebar as NotebookLeftSidebar } from './LeftSidebar';
import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';
import { NotebookProvider } from '@/contexts/NotebookContext';
import { useScreenSize } from '@/hooks/useScreenSize';
import { NoteEditorLayout } from './components/NoteEditorLayout';

/**
 * Inner layout content – renders left sidebars + the shared NoteEditorLayout.
 *
 * `{children}` is still rendered (required by Next.js) but page components
 * are now minimal / return null because NoteEditorLayout handles the editor,
 * top bar, and right sidebar.
 */
function NotebookLayoutContent({ children }: { children: ReactNode }) {
  const { isLeftSidebarOpen, closeLeftSidebar, openLeftSidebar, closeBothSidebars } = useSidebar();

  const { lgAndUp } = useScreenSize();
  const isDesktop = lgAndUp;

  // Responsive left-sidebar management (right sidebar is handled by NoteEditorLayout)
  useEffect(() => {
    if (lgAndUp) {
      openLeftSidebar();
    } else {
      closeBothSidebars();
    }
  }, [lgAndUp, openLeftSidebar, closeBothSidebars]);

  if (isDesktop === null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {isDesktop ? (
        /* Desktop: left sidebars + NoteEditorLayout (which contains top bar, editor, right sidebar) */
        <div
          className="grid min-h-screen w-full"
          style={{ gridTemplateColumns: '70px 300px minmax(0, 1fr)' }}
        >
          {/* Main Left Sidebar – 70px, always minimized */}
          <div className="border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
            <MainLeftSidebar forceMinimize={true} />
          </div>

          {/* Notebook Left Sidebar – 300px */}
          <div className="border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
            <NotebookLeftSidebar />
          </div>

          {/* Main content area – NoteEditorLayout manages its own right sidebar */}
          <div className="h-screen flex flex-col">
            <NoteEditorLayout />
            {/* Pages are still mounted for routing / side-effects */}
            {children}
          </div>
        </div>
      ) : (
        /* Mobile: single column + slide-out left sidebars */
        <div className="flex flex-col min-h-screen">
          <NoteEditorLayout />
          {/* Pages are still mounted for routing / side-effects */}
          {children}

          {/* Left Sidebar slide-out */}
          <Transition show={isLeftSidebarOpen} as={Fragment}>
            <Dialog onClose={closeLeftSidebar} className="relative z-50">
              <Transition.Child
                as={Fragment}
                enter="transition-opacity duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/[0.15]" aria-hidden="true" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex h-full">
                  {/* Main Left Sidebar in mobile */}
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition duration-200 ease-in-out"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition duration-200 ease-in-out"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                  >
                    <Dialog.Panel className="w-[70px] h-full bg-white shadow-xl overflow-y-auto border-r border-gray-200">
                      <MainLeftSidebar forceMinimize={true} />
                    </Dialog.Panel>
                  </Transition.Child>

                  {/* Notebook Left Sidebar */}
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition duration-200 ease-in-out"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition duration-200 ease-in-out"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                  >
                    <Dialog.Panel className="w-full max-w-[300px] h-full bg-white shadow-xl overflow-y-auto">
                      <div className="h-16 flex justify-end items-center p-4 sticky top-0 bg-white z-10">
                        <Button
                          onClick={closeLeftSidebar}
                          className="p-2 rounded-md hover:bg-gray-100"
                          variant="ghost"
                          size="icon"
                        >
                          <div className="flex">
                            <ChevronLeft className="h-5 w-5" />
                            <ChevronLeft className="h-5 w-5 -ml-3" />
                          </div>
                        </Button>
                      </div>
                      <div className="h-[calc(100vh-64px)] overflow-y-auto">
                        <NotebookLeftSidebar />
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
      )}
    </div>
  );
}

export default function NotebookLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotebookProvider>
      <SidebarProvider>
        <NotebookLayoutContent>{children}</NotebookLayoutContent>
      </SidebarProvider>
    </NotebookProvider>
  );
}
