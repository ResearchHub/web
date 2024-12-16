'use client'

import { 
  FileUp,         // for publishing preprint
  ScrollText,     // for journal
  HandCoins,      // for funding request
  GraduationCap,  // for grant
  Trophy,         // for reward
  Share,
  ChevronRight, 
  Plus,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { CreateRewardModal } from '../../components/modals/CreateRewardModal';
import toast from 'react-hot-toast';

interface PublishMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const PublishMenu: React.FC<PublishMenuProps> = ({ 
  isOpen, 
  onClose,
  children
}) => {
  const [showRewardModal, setShowRewardModal] = useState(false);

  const handleOverlayClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOverlayClick);
      return () => {
        document.removeEventListener('mousedown', handleOverlayClick);
      };
    }
  }, [isOpen, onClose]);

  const handleItemClick = (title: string) => {
    if (title === 'Create ResearchCoin Reward') {
      setShowRewardModal(true);
    } else {
      toast((t) => (
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Implementation coming soon</span>
        </div>
      ), {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#FFF7ED', // Orange-50
          color: '#EA580C',     // Orange-600
          border: '1px solid #FDBA74', // Orange-300
        },
      });
    }
    onClose();
  };

  const menuItems = [
    {
      section: 'Publish',
      items: [
        { icon: <FileUp className="w-5 h-5" />, title: 'Publish preprint', description: 'Share your research before peer review' },
        { icon: <ScrollText className="w-5 h-5" />, title: 'Publish in ResearchHub Journal', description: 'Submit to our peer-reviewed journal' },
      ]
    },
    {
      section: 'ResearchCoin Marketplace',
      items: [
        { icon: <Trophy className="w-5 h-5" />, title: 'Create ResearchCoin reward', description: 'Incentivize research contributions' },
        { icon: <GraduationCap className="w-5 h-5" />, title: 'Create grant', description: 'Fund promising research projects' },
        { icon: <HandCoins className="w-5 h-5" />, title: 'Start a fundraise', description: 'Seek support for your research' },
      ]
    },
    {
      section: 'Community',
      items: [
        { icon: <Share className="w-5 h-5" />, title: 'Share a paper', description: 'Discuss published research' },
      ]
    }
  ];

  return (
    <div className="relative w-full">
      {children}

      <CreateRewardModal 
        isOpen={showRewardModal} 
        onClose={() => setShowRewardModal(false)} 
      />

      {isOpen && (
        <div 
          className="fixed left-64 top-0 w-96 bg-white shadow-lg border-r p-6 h-screen z-60 publish-menu overflow-y-auto"
        >
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-8 last:mb-0">
              <h3 className="text-sm font-semibold text-indigo-600 mb-3">{section.section}</h3>
              {section.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  className="w-full text-left p-3 hover:bg-indigo-50 rounded-lg mb-2 last:mb-0 transition-colors duration-150"
                  onClick={() => handleItemClick(item.title)}
                >
                  <div className="flex items-center mb-1">
                    <div className="text-indigo-600">
                      {item.icon}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">{item.description}</p>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 