'use client'

import { 
  FileText, FileUp, ClipboardList, BookOpen, 
  Coins, Gift, PiggyBank, Share, ChevronRight, Plus 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { CreateRewardModal } from '../components/modals/CreateRewardModal';

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

  const menuItems = [
    {
      section: 'Publish',
      items: [
        { icon: <FileText className="w-5 h-5" />, title: 'Publish preprint', description: 'Share your research before peer review' },
        { icon: <FileUp className="w-5 h-5" />, title: 'Publish preregistration', description: 'Register your study design and methods' },
        { icon: <BookOpen className="w-5 h-5" />, title: 'Publish in ResearchHub Journal', description: 'Submit to our peer-reviewed journal' },
      ]
    },
    {
      section: 'ResearchCoin Marketplace',
      items: [
        { icon: <Coins className="w-5 h-5" />, title: 'Create ResearchCoin Reward', description: 'Incentivize research contributions' },
        { icon: <Gift className="w-5 h-5" />, title: 'Create grant', description: 'Fund promising research projects' },
        { icon: <PiggyBank className="w-5 h-5" />, title: 'Request funding', description: 'Seek support for your research' },
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
                  onClick={() => {
                    if (item.title === 'Create ResearchCoin Reward') {
                      setShowRewardModal(true);
                    }
                    onClose();
                  }}
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