'use client'

import { Plus, FileUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ClaimModal } from '@/components/modals/ClaimModal';
import { ClaimPaperIcon } from '@/components/ui/icons/ClaimPaperIcon';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { GrantIcon } from '@/components/ui/icons/GrantIcon';

interface PublishMenuProps {
  children?: React.ReactNode;
}

export const PublishMenu: React.FC<PublishMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
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
    if (action === 'claim') {
      setShowClaimModal(true);
    }
    setIsOpen(false);
  };

  const menuCategories = [
    {
      title: 'Your Research',
      items: [
        {
          icon: <FileUp strokeWidth={1.75} className="w-7 h-7" />,
          title: 'Submit new research',
          description: 'Submit your original research',
          action: 'publish'
        },
        {
          icon: <ClaimPaperIcon size={26} className="w-5 h-5" />,
          title: 'Claim paper',
          description: 'Earn ResearchCoin on your paper',
          action: 'claim'
        }
      ]
    },
    {
      title: 'Funding',
      items: [
        {
          icon: <FundingIcon size={28} className="w-5 h-5" color="rgb(79, 70, 229)" />,
          title: 'Request funding',
          description: 'Request funding on your research',
          action: 'request-funding'
        },
        {
          icon: <GrantIcon size={28} className="w-5 h-5" color="rgb(79, 70, 229)" />,
          title: 'Submit grant',
          description: 'Fund promising research by publishing an RFP',
          action: 'submit-grant'
        }
      ]
    }
  ];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 text-base font-medium text-white rounded-md transition-all duration-200 w-fit
            bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
            border border-white/10
            shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(255,255,255,0.1)_inset,0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]
            hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_-1px_0_0_rgba(255,255,255,0.2)_inset,0_6px_8px_-1px_rgba(0,0,0,0.2),0_4px_6px_-2px_rgba(0,0,0,0.1)]
            hover:scale-[1.02]
            active:scale-[0.98]
            min-w-[120px]"
      >
        <Plus className="h-6 w-6 stroke-[1.5]" />
        <span>New</span>
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
          style={{ 
            left: '0',
            top: 'calc(100% + 4px)',
            filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))'
          }}
        >
          <div className="py-2">
            {menuCategories.map((category, categoryIndex) => (
              <div key={category.title}>
                {categoryIndex > 0 && <div className="h-px bg-gray-100 mx-4 my-2" />}
                <div className="px-4 py-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {category.title}
                  </h3>
                </div>
                {category.items.map((item) => (
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
            ))}
          </div>
        </div>
      )}

      <ClaimModal 
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
      />
    </div>
  );
}; 