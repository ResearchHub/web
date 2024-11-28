import { TopBar } from '@/app/components/layout/TopBar'
import { LeftSidebar } from '@/app/components/layout/LeftSidebar'
import { PaperRightSidebar } from '@/app/components/paper/PaperRightSidebar'

interface PaperLayoutProps {
  children: React.ReactNode;
  paper: any; // You might want to define a proper type for this
}

export default function PaperLayout({
  children,
  paper,
}: PaperLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 ml-64 mr-80">
        <TopBar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <main>{children}</main>
        </div>
      </div>
      <PaperRightSidebar paper={paper} />
    </div>
  )
} 