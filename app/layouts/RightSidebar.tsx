'use client'

import { BookOpen, X, Check } from 'lucide-react';
import { useState } from 'react';

// InfoBanner Component
const InfoBanner: React.FC = () => (
  <div className="bg-indigo-50/60 rounded-xl p-6 mb-6">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center space-x-3">
        <BookOpen className="h-8 w-8 text-indigo-500/70" />
        <div className="text-xl font-semibold text-gray-900">ResearchHub Journal</div>
      </div>
      <button className="text-gray-400 hover:text-gray-600">
        <X className="h-5 w-5" />
      </button>
    </div>
    
    <div className="space-y-4 mb-6">
      <div className="flex items-center space-x-3">
        <Check className="h-5 w-5 text-indigo-500/70" />
        <span className="text-gray-700">14 days to peer reviews</span>
      </div>
      <div className="flex items-center space-x-3">
        <Check className="h-5 w-5 text-indigo-500/70" />
        <span className="text-gray-700">Paid peer reviewers</span>
      </div>
      <div className="flex items-center space-x-3">
        <Check className="h-5 w-5 text-indigo-500/70" />
        <span className="text-gray-700">Open access by default</span>
      </div>
    </div>
    
    <button className="w-full py-2.5 text-indigo-500 hover:text-indigo-600 font-medium">
      Learn more
    </button>
  </div>
);

// WhoToFollow Component
const WhoToFollow: React.FC = () => {
  const [followStatus, setFollowStatus] = useState<{ [key: string]: boolean }>({});

  const toggleFollow = (name: string) => {
    setFollowStatus((prevStatus) => ({
      ...prevStatus,
      [name]: !prevStatus[name],
    }));
  };

  const organizations = [
    { name: 'Nature', logo: '🌿', followers: '1.2M followers', type: 'Journal' },
    { name: 'Science', logo: '🔬', followers: '980K followers', type: 'Journal' },
    { name: 'MIT', logo: '🎓', followers: '750K followers', type: 'Institution' },
    { name: 'Stanford Medicine', logo: '🏥', followers: '420K followers', type: 'Institution' }
  ];

  const people = [
    { name: 'Dr. Sarah Chen', logo: '👩‍⚕️', followers: '89K followers', type: 'Neuroscientist', org: 'Stanford Medicine' },
    { name: 'Dr. James Wilson', logo: '👨‍⚕️', followers: '156K followers', type: 'Oncologist', org: 'Mayo Clinic' },
    { name: 'Dr. Elena Rodriguez', logo: '👩‍🔬', followers: '45K followers', type: 'AI Researcher', org: 'DeepMind' },
    { name: 'Prof. David Zhang', logo: '👨‍🏫', followers: '92K followers', type: 'Immunologist', org: 'Harvard Medical' }
  ];

  const ProfileCard = ({ profile }: { profile: any }) => {
    const isFollowing = followStatus[profile.name];

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
            {profile.logo}
          </div>
          <div>
            <div className="font-medium text-gray-900">{profile.name}</div>
            <div className="text-sm text-gray-500">
              {profile.type === 'Journal' || profile.type === 'Institution' ? (
                profile.followers
              ) : (
                <div className="flex flex-col">
                  <span>{profile.type}</span>
                  <span className="text-xs text-gray-400">{profile.org}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleFollow(profile.name)}
          className={`px-3 py-1 border rounded-full text-sm font-medium transition-colors duration-150 ${
            isFollowing
              ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
              : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-gray-900 mb-4">Who to Follow</h2>
      
      {/* Organizations Section */}
      <div className="space-y-4 mb-6">
        {organizations.map((org, i) => (
          <ProfileCard key={`org-${i}`} profile={org} />
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* People Section */}
      <div className="space-y-4">
        {people.map((person, i) => (
          <ProfileCard key={`person-${i}`} profile={person} />
        ))}
      </div>
    </div>
  );
};

// Main RightSidebar Component
export const RightSidebar: React.FC = () => (
  <div className="w-80 h-screen border-l bg-white p-6 overflow-y-auto">
    <InfoBanner />
    <WhoToFollow />
  </div>
);
