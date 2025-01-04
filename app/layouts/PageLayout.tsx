'use client'

import { ReactNode, useState } from 'react'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { TopBar } from './TopBar'

interface PageLayoutProps {
  children: ReactNode
  rightSidebar?: boolean
}

export function PageLayout({ children, rightSidebar = true }: PageLayoutProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile overlay */}
      {isLeftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <div className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white z-40 w-72 transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <LeftSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <TopBar onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
          <main className="px-4 py-4 lg:px-8">
            <div className="mx-auto max-w-4xl">
              {children}
            </div>
          </main>
        </div>

        {/* Right Sidebar */}
        {rightSidebar && (
          <div className="hidden lg:block w-80 border-l bg-white">
            <div className="sticky p-4">
              <RightSidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
