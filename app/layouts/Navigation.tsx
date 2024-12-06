'use client'

import { 
  Home, Coins, Store, 
  BookOpen, Star, BadgeCheck, Notebook,
  Info, ChevronDown, Settings, File, FileText, Plus
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface NavigationProps {
  currentPath: string;
  isPublishMenuOpen: boolean;
  onPublishMenuChange: (isOpen: boolean) => void;
  onUnimplementedFeature: (featureName: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPath, 
  isPublishMenuOpen, 
  onPublishMenuChange, 
  onUnimplementedFeature 
}) => {
  const isNotebookView = currentPath.startsWith('/notebook');

  const topNavigationItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      description: 'Navigate to the home page'
    },
    {
      label: 'Notebook',
      href: '/notebook',
      icon: Notebook,
      description: 'Access your research notebook'
    }
  ];

  const bottomNavigationItems = [
    {
      label: 'My ResearchCoin',
      href: '/researchcoin',
      icon: Coins,
      description: 'Manage your ResearchCoin balance and transactions',
      badge: {
        text: '+10 RSC',
        color: 'green'
      }
    },
    {
      label: 'Marketplace',
      href: '/marketplace',
      icon: Store,
      description: 'Browse and buy research papers'
    },
    {
      label: 'RH Journal',
      href: '/rhjournal',
      icon: BookOpen,
      description: 'Read and publish research papers',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onUnimplementedFeature('RH Journal');
      }
    },
    {
      label: 'Peer Reviews',
      href: '/peerreviews',
      icon: Star,
      description: 'Review and rate research papers',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onUnimplementedFeature('Peer Reviews');
      }
    },
    {
      label: 'Verify Identity',
      href: '/verifyidentity',
      icon: BadgeCheck,
      description: 'Verify your identity for secure transactions',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onUnimplementedFeature('Identity Verification');
      }
    },
    {
      label: 'About',
      href: '/about',
      icon: Info,
      description: 'Learn about ResearchHub'
    }
  ];

  const workspaceItems = [
    {
      label: 'Neural Network Architecture',
      href: '/notebook/neural-network',
      icon: FileText
    },
    {
      label: 'CRISPR Gene Editing Pr...',
      href: '/notebook/crispr',
      icon: FileText
    },
    {
      label: 'Quantum Computing Review',
      href: '/notebook/quantum',
      icon: FileText
    },
    {
      label: 'Lab Meeting Notes',
      href: '/notebook/lab-notes',
      icon: File
    },
    {
      label: 'RNA Sequencing Data',
      href: '/notebook/rna-seq',
      icon: File
    }
  ];

  const privateItems = [
    {
      label: 'Grant Proposal Draft',
      href: '/notebook/grant-proposal',
      icon: File
    },
    {
      label: 'Research Ideas 2024',
      href: '/notebook/research-ideas',
      icon: FileText
    }
  ];

  const getButtonStyles = (path: string) => {
    const isActive = currentPath === path;
    return isActive
      ? "flex items-center w-full px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg group"
      : "flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group";
  };

  const getIconStyles = (path: string) => {
    const isActive = currentPath === path;
    return `h-5 w-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}`;
  };

  if (isNotebookView) {
    const [isOrgListOpen, setIsOrgListOpen] = useState(false);
    
    const organizations = [
      {
        id: '1',
        name: 'SOME ORG 2021',
        initials: 'SO',
        gradientFrom: 'from-indigo-500',
        gradientTo: 'to-purple-500'
      },
      {
        id: '2',
        name: 'Research Lab',
        initials: 'RL',
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-cyan-500'
      },
      {
        id: '3',
        name: 'Personal Space',
        initials: 'PS',
        gradientFrom: 'from-emerald-500',
        gradientTo: 'to-teal-500'
      }
    ];
    
    const currentOrg = organizations[0];

    return (
      <div className="space-y-2">
        {/* Home Link */}
        <Link 
          href="/"
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Home className="h-5 w-5 mr-3 text-gray-500" />
          <span className="truncate">Home</span>
        </Link>

        {/* Notebook with Org Selector */}
        <div>
          <div className="flex items-center w-full px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">
            <Notebook className="h-5 w-5 mr-3 text-indigo-600" />
            <span className="truncate">Notebook</span>
          </div>
          
          {/* Current Organization */}
          <div className="mt-1 pl-8">
            <button 
              onClick={() => setIsOrgListOpen(!isOrgListOpen)}
              className="w-full flex items-center text-left py-2 text-sm text-gray-900 transition-colors group"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-5 h-5 bg-gradient-to-br ${currentOrg.gradientFrom} ${currentOrg.gradientTo} rounded flex items-center justify-center text-white text-xs font-medium`}>
                  {currentOrg.initials}
                </div>
                <span>{currentOrg.name}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOrgListOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Other Organizations */}
            {isOrgListOpen && (
              <div className="mt-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {organizations.slice(1).map((org) => (
                  <button 
                    key={org.id}
                    className="w-full flex items-center text-left py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 bg-gradient-to-br ${org.gradientFrom} ${org.gradientTo} rounded flex items-center justify-center text-white text-xs font-medium`}>
                        {org.initials}
                      </div>
                      <span>{org.name}</span>
                    </div>
                  </button>
                ))}

                {/* Add Organization Button */}
                <button className="w-full flex items-center text-left py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                      <Plus className="h-3 w-3" />
                    </div>
                    <span>Add Organization</span>
                  </div>
                </button>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1" />

                {/* Settings & Members */}
                <button className="w-full text-left py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings & Members</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="border-t border-gray-100" />
        </div>

        {/* Workspace Section */}
        <div>
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-500">WORKSPACE</h3>
            <button className="text-gray-400 hover:text-gray-500">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            {workspaceItems.map(item => (
              <Link 
                key={item.href}
                href={item.href} 
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <item.icon className="h-3.5 w-3.5 text-gray-400 mr-2" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Private Section */}
        <div>
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-500">PRIVATE</h3>
            <button className="text-gray-400 hover:text-gray-500">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            {privateItems.map(item => (
              <Link 
                key={item.href}
                href={item.href} 
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <item.icon className="h-3.5 w-3.5 text-gray-400 mr-2" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top Navigation Section */}
      <div className="space-y-1">
        {topNavigationItems.map(item => (
          <Link 
            key={item.href}
            href={item.href} 
            className={getButtonStyles(item.href)}
          >
            <item.icon className={getIconStyles(item.href)} />
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="truncate">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Bottom Navigation Section */}
      <div className="space-y-1">
        {bottomNavigationItems.map(item => (
          <Link 
            key={item.href}
            href={item.href} 
            className={getButtonStyles(item.href)}
            onClick={item.onClick}
          >
            <item.icon className={getIconStyles(item.href)} />
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="flex-shrink-0 bg-green-50 text-green-700 text-[10px] font-medium px-1 py-0.5 rounded-full ml-2 whitespace-nowrap">
                  +10 RSC
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
