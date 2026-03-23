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

import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { LeftSidebar as NotebookLeftSidebar } from '@/components/Notebook/LeftSidebar';
import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';
import { NotebookProvider } from '@/contexts/NotebookContext';
import { useScreenSize } from '@/hooks/useScreenSize';
import { NoteEditorLayout } from '@/components/Notebook/NoteEditorLayout';

function NotebookLayoutContent({ children }: { children: ReactNode }) {
  const { isLeftSidebarOpen, closeLeftSidebar, openLeftSidebar, closeBothSidebars } = useSidebar();

  const { lgAndUp } = useScreenSize();
  const isDesktop = lgAndUp;

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
      <div
        className="grid min-h-screen w-full"
        style={{
          gridTemplateColumns: isDesktop ? '70px 300px minmax(0, 1fr)' : '0px 0px minmax(0, 1fr)',
        }}
      >
        <div
          className={`h-screen sticky top-0 overflow-hidden ${isDesktop ? 'border-r border-gray-200' : ''}`}
        >
          {isDesktop && <MainLeftSidebar forceMinimize={true} />}
        </div>
        <div
          className={`h-screen sticky top-0 overflow-hidden ${isDesktop ? 'border-r border-gray-200' : ''}`}
        >
          {isDesktop && <NotebookLeftSidebar />}
        </div>
        <div className={`${isDesktop ? 'h-screen' : 'min-h-screen'} flex flex-col`}>
          <NoteEditorLayout />
          {children}
        </div>
      </div>

      {!isDesktop && (
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
