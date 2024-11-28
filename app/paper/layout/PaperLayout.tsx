import { TopBar } from '@/app/components/layout/TopBar'
import { LeftSidebar } from '@/app/components/layout/LeftSidebar'
import { PaperNavigation } from './PaperNavigation'

export default function PaperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1">
        <TopBar />
        <PaperNavigation />
        <main className="pt-6">{children}</main>
      </div>
    </div>
  )
} 