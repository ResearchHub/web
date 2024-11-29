import { TopBar } from '@/app/components/layout/TopBar'
import { LeftSidebar } from '@/app/components/layout/LeftSidebar'
import { ProfileRightSidebar } from '@/app/components/profile/ProfileRightSidebar'

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({
  children,
}: ProfileLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 ml-64 mr-80">
        <TopBar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <main>{children}</main>
        </div>
      </div>
      <ProfileRightSidebar />
    </div>
  )
} 