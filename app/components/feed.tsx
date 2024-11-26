'use client'

import React, { useState } from 'react';
import { 
  Bell, Search, Star, ArrowUp, MessageSquare, 
  BookOpen, Users, Bookmark, Share2, CircleUser, 
  Coins, Home, FileText, DollarSign,
  Settings, LogOut, ChevronDown, Eye, EyeOff,
  GraduationCap, UserPlus, Beaker, BadgeCheck,
  Building2, ArrowUpCircle, ArrowDownCircle, BookCopy,
  Notebook, X, Check, Filter, Trophy, Users2, Info, Wallet
} from 'lucide-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXTwitter, 
  faDiscord, 
  faGithub, 
  faLinkedin 
} from '@fortawesome/free-brands-svg-icons';

const Navigation: React.FC = () => (
  <div className="space-y-1">
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg group">
      <Home className="h-5 w-5 mr-3 text-indigo-600" />
      Home
    </button>
    <button className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <div className="flex items-center">
        <Coins className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
        My ResearchCoin
      </div>
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
        +10
      </span>
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <GraduationCap className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      Learn
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <Wallet className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      Marketplace
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <BookOpen className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      RH Journal
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <Star className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      Peer Reviews
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <BadgeCheck className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      Verify Identity
    </button>
  </div>
);

const FeedItem: React.FC<{ item: any }> = ({ item }) => (
  <div className="p-6">
    <div className="flex flex-col">
      <div className="flex items-start mb-3">
        <div className="flex-shrink-0 mr-4">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <CircleUser className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="font-medium text-gray-900">{item.user}</span>
            {item.verified && <BadgeCheck className="h-4 w-4 text-blue-500 ml-1" />}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {item.type === 'funding_request' && <DollarSign className="h-4 w-4 text-green-500" />}
            {item.type === 'grant' && <DollarSign className="h-4 w-4 text-green-500" />}
            {item.type === 'review' && <Star className="h-4 w-4 text-yellow-400" />}
            {item.type === 'publish' && <FileText className="h-4 w-4 text-blue-500" />}
            <span>
              {item.type === 'funding_request' ? 'Created a funding request' :
               item.type === 'grant' ? 'Created a grant' :
               item.type === 'review' ? 'Reviewed a paper' : 'Published a paper'}
            </span>
            <span>·</span>
            <span>{item.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-3">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
        
        {item.type === 'funding_request' && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">{item.amount} RSC raised</span>
                  <span className="text-sm text-gray-500">of {item.goal} RSC goal</span>
                </div>
                <span className="text-sm text-green-500 font-medium">Fundraise Completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white" />
                ))}
                <div className="h-6 px-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center ml-1">
                  +6 others
                </div>
              </div>
              <span className="text-sm text-gray-600">contributed RSC</span>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100">
              <Coins className="h-4 w-4" />
              <span>Contribute RSC</span>
            </button>
          </>
        )}

        {item.type === 'grant' && (
          <>
            <div className="flex items-center space-x-2 mb-4">
              <Coins className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900">{item.amount} RSC grant</span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white" />
                ))}
                <div className="h-6 px-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center ml-1">
                  +12 others
                </div>
              </div>
              <span className="text-sm text-gray-600">contributed RSC</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users2 className="h-4 w-4" />
                <span>{item.applicants} applicants</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Apply Now
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100">
                <Coins className="h-4 w-4" />
                <span>Contribute RSC</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center space-x-4">
        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
          <ArrowUp className="h-4 w-4" />
          <span className="text-sm">{item.votes}</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm">{item.comments}</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
          <Coins className="h-4 w-4" />
          <span className="text-sm">Tip</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
          <Bookmark className="h-4 w-4" />
          <span className="text-sm">Save</span>
        </button>
      </div>
    </div>
  </div>
);

const WhoToFollow: React.FC = () => (
  <div className="bg-white rounded-xl border p-4">
    <h2 className="font-semibold text-gray-900 mb-4">Who to Follow</h2>
    <div className="space-y-4">
      {[
        { name: 'Nature', logo: '🌿', followers: '1.2M followers' },
        { name: 'Science', logo: '🔬', followers: '980K followers' },
        { name: 'MIT', logo: '🎓', followers: '750K followers' },
        { name: 'Stanford Medicine', logo: '🏥', followers: '420K followers' }
      ].map((org, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
              {org.logo}
            </div>
            <div>
              <div className="font-medium text-gray-900">{org.name}</div>
              <div className="text-sm text-gray-500">{org.followers}</div>
            </div>
          </div>
          <button className="px-3 py-1 border border-indigo-600 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-50">
            Follow
          </button>
        </div>
      ))}
    </div>
  </div>
);

const FeedTabs: React.FC = () => (
  <div className="border-b mb-6">
    <div className="flex space-x-8">
      <button className="px-1 py-4 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
        For You
      </button>
      <button className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
        Following
      </button>
    </div>
  </div>
);

const InfoBanner: React.FC = () => (
  <div className="bg-indigo-600 rounded-xl p-6 mb-6 text-white">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center space-x-3">
        <BookOpen className="h-8 w-8" />
        <div className="text-xl font-semibold">ResearchHub Journal</div>
      </div>
      <button className="text-white/80 hover:text-white">
        <X className="h-5 w-5" />
      </button>
    </div>
    
    <div className="space-y-4 mb-6">
      <div className="flex items-center space-x-3">
        <Check className="h-5 w-5 text-white" />
        <span>14 days to peer reviews</span>
      </div>
      <div className="flex items-center space-x-3">
        <Check className="h-5 w-5 text-white" />
        <span>Paid peer reviewers</span>
      </div>
      <div className="flex items-center space-x-3">
        <Check className="h-5 w-5 text-white" />
        <span>Open access by default</span>
      </div>
    </div>
    
    <button className="w-full py-2.5 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90">
      Learn more
    </button>
  </div>
);

const FooterLinks: React.FC = () => (
  <div className="px-4 py-6 border-t text-sm">
    <div className="flex items-center space-x-4 mb-4">
      <a href="#" className="text-gray-500 hover:text-gray-700">
        <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
      </a>
      <a href="#" className="text-gray-500 hover:text-gray-700">
        <FontAwesomeIcon icon={faDiscord} className="h-5 w-5" />
      </a>
      <a href="#" className="text-gray-500 hover:text-gray-700">
        <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
      </a>
      <a href="#" className="text-gray-500 hover:text-gray-700">
        <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
      </a>
    </div>
    <div className="flex flex-wrap gap-3 text-gray-500">
      <a href="#" className="hover:text-gray-700">Terms</a>
      <a href="#" className="hover:text-gray-700">Privacy</a>
      <a href="#" className="hover:text-gray-700">Issues</a>
      <a href="#" className="hover:text-gray-700">Docs</a>
      <a href="#" className="hover:text-gray-700">Community</a>
      <a href="#" className="hover:text-gray-700">About</a>
    </div>
  </div>
);

const TopBar: React.FC = () => (
  <div className="sticky top-0 backdrop-blur-md bg-white/80 border-b border-gray-100 z-40 h-16">
    <div className="max-w-3xl mx-auto h-full px-4">
      <div className="flex items-center justify-between h-full">
        <div className="relative w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search papers, reviews, grants..."
            className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-gray-200"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700">
            <FileText className="h-4 w-4" />
            <span>Publish</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="relative">
            <Notebook className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
          </button>
          <button className="relative">
            <Bell className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          <button className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <CircleUser className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ResearchFeed: React.FC = () => {
  const [publishOpen, setPublishOpen] = useState(false);

  const feedItems = [
    {
      type: 'funding_request',
      user: 'Dominikus Brian',
      verified: true,
      timestamp: 'Oct 9, 2024',
      title: 'Incentivized vs Non-Incentivized Open Peer Reviews: Dynamics, Economics, and Quality',
      description: 'Research project exploring the impact of incentive structures on peer review quality and participation',
      amount: '122,131',
      goal: '36,389',
      votes: 45,
      comments: 21,
      contributors: 6
    },
    {
      type: 'grant',
      user: 'Adam Draper',
      verified: true,
      timestamp: '1h ago',
      title: 'Water Quality Research Grant',
      description: 'Seeking researchers to conduct comprehensive water quality analysis in developing regions.',
      amount: '500,000',
      votes: 32,
      comments: 12,
      contributors: 15,
      applicants: 8
    },
    {
      type: 'review',
      user: 'Dr. Elena Rodriguez',
      organization: 'MIT',
      verified: true,
      timestamp: '2h ago',
      title: 'Review of "Revolutionizing Patient Care: Advances in Flexible Printed Heaters"',
      description: 'Excellent methodology and comprehensive literature review. The discussion of thermal management challenges could be expanded.',
      votes: 12,
      comments: 3,
      rsc: 150,
      tags: ['Medical Science', 'Thermal Management', 'Patient Care']
    },
    {
      type: 'publish',
      user: 'Hundessa Nemomssa',
      organization: 'Stanford University',
      verified: true,
      timestamp: '4h ago',
      title: 'Revolutionizing Patient Care: A Comprehensive Review',
      description: 'New preprint exploring recent developments in flexible printed heaters for medical devices.',
      votes: 24,
      comments: 7,
      rsc: 300,
      tags: ['Medical Devices', 'Flexible Printed Heaters', 'Patient Care']
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 fixed h-screen border-r bg-white overflow-y-auto flex flex-col">
        <div className="flex-1">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <Beaker className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                ResearchHub
              </h1>
            </div>
          </div>
          
          <div className="px-2 py-4">
            <Navigation />
          </div>
        </div>

        <FooterLinks />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 mr-80">
        <TopBar />
        <div className="max-w-3xl mx-auto px-4 py-6">
          <FeedTabs />
          <div className="space-y-4">
            {feedItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <FeedItem item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="fixed right-0 top-0 w-80 h-screen border-l bg-white p-4 overflow-y-auto">
        <InfoBanner />
        <WhoToFollow />
      </div>
    </div>
  );
}

export default ResearchFeed;