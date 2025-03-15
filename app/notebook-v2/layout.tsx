'use client';

import { ReactNode, useEffect, useState } from 'react';
import './globals.css';
import 'cal-sans';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { Menu, X, Settings } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Import font styles
import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { LeftSidebar } from './LeftSidebar';
import { OrganizationProvider } from '@/contexts/OrganizationContextV2';
import { OrganizationDataProvider } from '@/contexts/OrganizationDataContext';
import { RightSidebar } from './RightSidebar';
import { NotebookPublishProvider } from '@/contexts/NotebookPublishContext';

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

  // If we don't know yet if it's desktop or mobile, don't render anything
  // This prevents the flash of mobile layout on desktop
  if (isDesktop === null) {
    return null; // Or a loading spinner
  }

  console.log({ isDesktop });

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
            <div className="h-16 border-b border-gray-200">
              {/* TopBar content will go here */}
              <div className="p-4">TopBar Placeholder</div>
            </div>

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
              <button
                onClick={toggleLeftSidebar}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Toggle left sidebar"
              >
                {isLeftSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Center content - page title or logo */}
              <div className="flex-1 text-center">
                <h1 className="text-lg font-medium">Notebook</h1>
              </div>

              {/* Right sidebar toggle button */}
              <button
                onClick={toggleRightSidebar}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Toggle right sidebar"
              >
                {isRightSidebarOpen ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
              </button>
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
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <Dialog.Title className="text-lg font-medium">Menu</Dialog.Title>
                        <button
                          onClick={closeLeftSidebar}
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          <X className="h-5 w-5" />
                        </button>
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
                      <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <Dialog.Title className="text-lg font-medium">Settings</Dialog.Title>
                        <button
                          onClick={closeRightSidebar}
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          <X className="h-5 w-5" />
                        </button>
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
        <NotebookPublishProvider>
          <SidebarProvider>
            <NotebookLayoutContent>{children}</NotebookLayoutContent>
          </SidebarProvider>
        </NotebookPublishProvider>
      </OrganizationDataProvider>
    </OrganizationProvider>
  );
}
