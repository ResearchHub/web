'use client'

import { useState } from 'react';
import { Search, Bell, CircleUser, Menu, BadgeCheck, X, AlertCircle, LogIn } from 'lucide-react';
import { searchFeedItems } from '@/store/feedStore';
import { getItemTypeConfig } from '@/components/FeedItem';
import { useSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import AuthModal from '@/components/modals/Auth/AuthModal';
import UserMenu from '@/components/menus/UserMenu'
import type { User } from '@/types/user'
import { useNotifications } from '@/contexts/NotificationContext'
import { useRouter } from 'next/navigation'
import { NotificationBell } from '@/components/Notification/NotificationBell'

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { data: session, status } = useSession();
  const { unreadCount } = useNotifications();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const router = useRouter()

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = event.target.value;
    setQuery(searchQuery);
    const searchResults = searchFeedItems(searchQuery).map(entry => entry.item);
    setResults(searchResults);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const handleAuthClick = () => {
    if (session) {
      signOut();
    } else {
      setIsAuthModalOpen(true);
    }
  };

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

            {/* Title */}
            <h1 className="hidden lg:block text-xl font-semibold text-gray-900">Today in Science</h1>

            <div className="flex items-center gap-4 ml-auto">
              <div className="relative w-[380px]">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search papers, reviews, grants..."
                  className="pl-10 pr-10 py-2 bg-gray-50 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-gray-200"
                  value={query}
                  onChange={handleSearch}
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}

                {/* Render search results */}
                {results.length > 0 && (
                  <div className="absolute left-0 right-0 bg-white shadow-lg rounded-lg mt-2 z-10 max-h-[80vh] overflow-y-auto w-[500px]">
                    <ul className="divide-y divide-gray-100">
                      {results.map((item, index) => {
                        const { icon: IconComponent, label } = getItemTypeConfig(item.type);
                        return (
                          <li key={index} className="p-4 hover:bg-gray-50">
                            {/* Type Badge */}
                            <div className="flex items-center mb-2">
                              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200">
                                <IconComponent className="w-3 h-3 mr-1" />
                                {label}
                              </div>
                            </div>

                            {/* Title and Authors */}
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                              {item.type === 'paper' && item.authors && (
                                <div className="flex-1 text-xs text-gray-600 mt-1">
                                  {item.authors.map((author, i) => (
                                    <span key={i} className="inline-flex items-center">
                                      <span>{author.name}</span>
                                      {author.verified && (
                                        <BadgeCheck className="h-4 w-4 text-blue-500 ml-1 inline" />
                                      )}
                                      {i < item.authors.length - 1 && (
                                        <span className="mx-2 text-gray-400">•</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-600 mt-1">
                              {item.description.length > 100 
                                ? `${item.description.slice(0, 100)}...` 
                                : item.description}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>        

              {/* Add fixed width placeholder for session loading state */}
              <div className="flex items-center space-x-4 w-[100px]">
                {status !== "loading" ? (
                  session ? (
                    <>
                      <NotificationBell />
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
