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
        className="flex items-center gap-3 px-5 py-2.5 text-base font-medium text-white rounded-md transition-all duration-200 min-w-[120px]
          bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
          border border-white/10
          shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(255,255,255,0.1)_inset,0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]
          hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_-1px_0_0_rgba(255,255,255,0.2)_inset,0_6px_8px_-1px_rgba(0,0,0,0.2),0_4px_6px_-2px_rgba(0,0,0,0.1)]
          hover:scale-[1.02]
          active:scale-[0.98]"
      >
        <Plus className="h-6 w-6 stroke-[1.5]" />
        <span>New</span>
      </button>

      <CreateRewardModal 
        isOpen={showRewardModal} 
        onClose={() => setShowRewardModal(false)} 
      />

      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute w-72 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
          style={{ 
            left: '0',
            top: 'calc(100% + 4px)',
            filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))'
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