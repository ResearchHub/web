'use client';

import { ReactNode, useEffect, useState } from 'react';
import './globals.css';
import 'cal-sans';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import {
  Menu,
  X,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Send,
  Share,
  Upload,
  BookOpen,
} from 'lucide-react';
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
import { LeftSidebar } from './LeftSidebar';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { OrganizationDataProvider } from '@/contexts/OrganizationDataContext';
import { RightSidebar } from './RightSidebar';

// Define breakpoint as a constant
const DESKTOP_BREAKPOINT = 1024;

function NotebookLayoutContent({ children }: { children: ReactNode }) {
  const {
    isLeftSidebarOpen,
    isRightSidebarOpen,
    closeLeftSidebar,
    closeRightSidebar,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useSidebar();
  // Initialize with null to indicate we don't know yet
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  // Check if we're on desktop when component mounts and when window resizes
  useEffect(() => {
    // Function to check viewport width
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    // Initial check - run immediately
    checkIfDesktop();

    // Add event listener for resize
    window.addEventListener('resize', checkIfDesktop);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  if (isDesktop === null) {
    // TODO: add a loading spinner???
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {isDesktop ? (
        // Desktop layout - 3 columns grid
        <div
          className="grid min-h-screen w-full"
          style={{
            gridTemplateColumns: '300px minmax(0, 1fr) 300px',
          }}
        >
          {/* Left Sidebar - 300px fixed width */}
          <div className="border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
            <LeftSidebar />
          </div>

          {/* Main content area - flexible width */}
          <div className="flex flex-col">
            {/* TopBar */}
            {/* <div className="h-16 border-b border-gray-200">
            <div className="p-4">TopBar Placeholder</div>
            </div> */}

            {/* Main content */}
            <div className="flex-1 overflow-auto">{children}</div>
          </div>

          {/* Right Sidebar - 300px fixed width */}
          <div className="border-l border-gray-200 h-screen sticky top-0 overflow-y-auto">
            <RightSidebar />
          </div>
        </div>
      ) : (
        // Mobile layout - single column with slide-out sidebars
        <div className="flex flex-col min-h-screen">
          {/* Mobile TopBar with menu buttons */}
          <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-20">
            <div className="h-full flex items-center px-4 justify-between">
              {/* Left sidebar toggle button */}
              <Button
                onClick={toggleLeftSidebar}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Toggle left sidebar"
                variant="ghost"
                size="icon"
              >
                <div className="flex">
                  <Menu className="h-5 w-5" />
                </div>
              </Button>

              {/* Center content - page title or logo */}
              <div className="flex-1 text-center">
                <h1 className="text-lg font-medium">Notebook</h1>
              </div>

              {/* Right sidebar toggle button */}
              <Button
                onClick={toggleRightSidebar}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Toggle right sidebar"
                variant="ghost"
                size="sm"
              >
                <div className="flex items-center gap-1">
                  <FileUp className="h-4 w-4" />
                  <span>Publish</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">{children}</div>

          {/* Left Sidebar Dialog with Transition */}
          <Transition show={isLeftSidebarOpen} as={Fragment}>
            {/* Backdrop with fade transition */}
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

              {/* Sidebar slide transition */}
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
                    <Dialog.Panel className="w-72 h-full bg-white shadow-xl overflow-y-auto">
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
                      <div className="h-[calc(100vh-72px)] overflow-y-auto">
                        <LeftSidebar />
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>

          {/* Right Sidebar Dialog with Transition */}
          <Transition show={isRightSidebarOpen} as={Fragment}>
            <Dialog onClose={closeRightSidebar} className="relative z-50">
              {/* Backdrop with fade transition */}
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

              {/* Sidebar slide transition */}
              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex h-full justify-end">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition duration-200 ease-in-out"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition duration-200 ease-in-out"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="w-72 h-full bg-white shadow-xl overflow-y-auto">
                      <div className="h-16 flex justify-start items-center p-4 sticky top-0 bg-white z-10">
                        <Button
                          onClick={closeRightSidebar}
                          className="p-2 rounded-md hover:bg-gray-100"
                          variant="ghost"
                          size="icon"
                        >
                          <div className="flex">
                            <ChevronRight className="h-5 w-5" />
                            <ChevronRight className="h-5 w-5 -ml-3" />
                          </div>
                        </Button>
                      </div>
                      <div className="h-[calc(100vh-72px)] overflow-y-auto">
                        <RightSidebar />
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
    <OrganizationProvider>
      <OrganizationDataProvider>
        <SidebarProvider>
          <NotebookLayoutContent>{children}</NotebookLayoutContent>
        </SidebarProvider>
      </OrganizationDataProvider>
    </OrganizationProvider>
  );
}
