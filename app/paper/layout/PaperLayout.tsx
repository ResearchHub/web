import { TopBar } from '@/app/components/layout/TopBar'
import { LeftSidebar } from '@/app/components/layout/LeftSidebar'

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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <main className="pt-6">{children}</main>
        </div>
      </div>
    </div>
  )
} 