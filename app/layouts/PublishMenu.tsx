'use client'

import { 
  FileUp,
  GraduationCap,
  Trophy,
  HandCoins,
  AlertCircle,
  Plus,
  ChevronDown
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CreateRewardModal } from '../../components/modals/CreateRewardModal';
import toast from 'react-hot-toast';

interface PublishMenuProps {
  children?: React.ReactNode;
}

export const PublishMenu: React.FC<PublishMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (action: string) => {
    if (action === 'reward') {
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
          background: '#FFF7ED',
          color: '#EA580C',    
          border: '1px solid #FDBA74',
        },
      });
    }
    setIsOpen(false);
  };

  const menuItems = [
    { 
      icon: <FileUp className="w-5 h-5" />, 
      title: 'Publish', 
      description: 'Publish preprint or submit to RH Journal',
      action: 'publish'
    },
    { 
      icon: <Trophy className="w-5 h-5" />, 
      title: 'Create Reward', 
      description: 'Open a scientific reward',
      action: 'reward'
    },
    { 
      icon: <GraduationCap className="w-5 h-5" />, 
      title: 'Create Grant', 
      description: 'Fund promising research',
      action: 'grant'
    },
    { 
      icon: <HandCoins className="w-5 h-5" />, 
      title: 'Start a Fundraise', 
      description: 'Seek research support',
      action: 'fundraise'
    }
  ];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4A24E0] hover:bg-[#3D1DB9] rounded-lg transition-all duration-200"
      >
        <Plus className="h-5 w-5" />
        <span>New</span>
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>

      <CreateRewardModal 
        isOpen={showRewardModal} 
        onClose={() => setShowRewardModal(false)} 
      />

      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute w-72 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
          style={{ 
            right: '0', // Position to the left with 8px gap
            top: '45px',
          }}
        >
          <div className="py-2">
            {menuItems.map((item) => (
              <button
                key={item.title}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors duration-150"
                onClick={() => handleItemClick(item.action)}
              >
                <div className="flex items-center">
                  <div className="text-indigo-600">
                    {item.icon}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 