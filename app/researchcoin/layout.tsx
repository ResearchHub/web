import { TopBar } from '@/app/components/layout/TopBar'
import { LeftSidebar } from '@/app/components/layout/LeftSidebar'
import { ResearchCoinRightSidebar } from '@/app/components/researchcoin/ResearchCoinRightSidebar'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <LeftSidebar />
      <div className="flex-1 ml-64 mr-80">
        <TopBar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <main>{children}</main>
        </div>
      </div>
      <ResearchCoinRightSidebar />
    </div>
  )
} 