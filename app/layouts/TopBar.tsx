'use client'

import { useState } from 'react';
import { Menu, BadgeCheck, LogIn, MoveLeft } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from '@/components/modals/Auth/AuthModal';
import UserMenu from '@/components/menus/UserMenu'
import type { User } from '@/types/user'
import { useNotifications } from '@/contexts/NotificationContext'
import { useRouter, usePathname } from 'next/navigation'
import { NotificationBell } from '@/components/Notification/NotificationBell'
import { SearchInput } from '@/components/Search/SearchInput'

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { data: session, status } = useSession();
  const { unreadCount } = useNotifications();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter()
  const pathname = usePathname()

  const getPageTitle = () => {
    if (!pathname) return 'Today in Science'
    
    if (pathname === '/notifications') {
      return 'Notifications'
    }
    
    if (pathname === '/profile') {
      return 'Profile'
    }
    
    if (pathname.includes('/paper')) {
      return 'Paper'
    }

    if (pathname.includes('/funding')) {
      return 'Funding'
    }

    return 'Today in Science'
  }

  const isNotificationsPage = pathname === '/notifications'

  const handleAuthClick = () => {
    if (session) {
      signOut();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const showBackArrow = pathname?.includes('/paper')

  return (
    <>
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-20 h-[64px]">
        <div className="lg:ml-10 lg:mr-10 h-full">
          <div className="h-full flex items-center justify-between">
            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Title with Back Arrow */}
            <div className="hidden lg:flex items-center gap-3">
              {showBackArrow && (
                <button 
                  onClick={() => router.back()}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all duration-150"
                >
                  <MoveLeft className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="relative w-[500px]">
                <SearchInput 
                  placeholder="Search papers, people, ..."
                  className="w-full border-gray-300 rounded-lg"
                  iconPosition="right"
                />
              </div>        

              <div className="flex items-center gap-4">
                {status !== "loading" ? (
                  session ? (
                    <>
                      <NotificationBell filled={isNotificationsPage} />
                      <UserMenu 
                        user={session.user as User}
                        onViewProfile={() => null}
                        onVerifyAccount={() => null}
                      />
                    </>
                  ) : (
                    <button
                      onClick={handleAuthClick}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <LogIn className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Sign In</span>
                    </button>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
