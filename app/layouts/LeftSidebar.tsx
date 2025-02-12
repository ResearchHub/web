'use client';

import { AlertCircle, Megaphone } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { FooterLinks } from '../../components/FooterLinks';
import { Navigation } from './Navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PublishMenu } from './PublishMenu';
import { Logo } from '@/components/ui/Logo';
import { ReleaseNotesModal } from '@/components/modals/ReleaseNotesModal';

// This key should be updated whenever the release notes content changes
const RELEASE_NOTES_VERSION = 'v1.0.2';
const STORAGE_KEY = `rh-release-notes-${RELEASE_NOTES_VERSION}`;

export const LeftSidebar: React.FC = () => {
  const pathname = usePathname();
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
  const [hasSeenReleaseNotes, setHasSeenReleaseNotes] = useState(true); // Default to true to prevent flash

  useEffect(() => {
    // Check if user has seen the current version of release notes
    const hasSeenNotes = localStorage.getItem(STORAGE_KEY);
    setHasSeenReleaseNotes(!!hasSeenNotes);
  }, []);

  const handleReleaseNotesClick = () => {
    setIsReleaseNotesOpen(true);
    // Mark as seen
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasSeenReleaseNotes(true);
  };

  const handleUnimplementedFeature = (featureName: string) => {
    toast(
      (t) => (
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Implementation coming soon</span>
        </div>
      ),
      {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#FFF7ED',
          color: '#EA580C',
          border: '1px solid #FDBA74',
        },
      }
    );
  };

  return (
    <div className="w-72 fixed h-screen flex flex-col z-50 bg-white">
      <div className="p-2 pl-4">
        <Logo size={38} color="text-indigo-600" />
      </div>

      <div className="px-4 mt-6">
        <PublishMenu />
      </div>

      <div className="flex-1">
        <div className="px-4 py-4">
          <Navigation
            currentPath={pathname || ''}
            onUnimplementedFeature={handleUnimplementedFeature}
          />
        </div>
      </div>

      <div className="px-4 py-4">
        <button
          onClick={handleReleaseNotesClick}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-500 hover:bg-gray-50 rounded-lg relative"
        >
          <Megaphone className="w-5 h-5" />
          <span className="flex items-center gap-2">
            Release Notes
            {!hasSeenReleaseNotes && (
              <span className="w-2 h-2 bg-orange-500 rounded-full inline-block" />
            )}
          </span>
        </button>
      </div>

      <FooterLinks />

      <ReleaseNotesModal isOpen={isReleaseNotesOpen} onClose={() => setIsReleaseNotesOpen(false)} />
    </div>
  );
};
