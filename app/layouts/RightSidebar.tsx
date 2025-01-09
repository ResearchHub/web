'use client'

import { BookOpen, X, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

// InfoBanner Component
const InfoBanner: React.FC = () => (
  <div className="bg-indigo-50 rounded-lg p-5 mb-6">
    <div className="flex flex-col items-center mb-4">
      <BookOpen className="h-8 w-8 text-indigo-900 mb-2" />
      <div className="text-lg font-semibold text-indigo-900 text-center">ResearchHub Journal</div>
    </div>
    
    <div className="space-y-2.5 mb-5">
      <div className="flex items-center space-x-2.5">
        <Check className="h-4 w-4 text-indigo-900 flex-shrink-0" />
        <span className="text-sm text-gray-700">14 days to peer reviews</span>
      </div>
      <div className="flex items-center space-x-2.5">
        <Check className="h-4 w-4 text-indigo-900 flex-shrink-0" />
        <span className="text-sm text-gray-700">Paid peer reviewers</span>
      </div>
      <div className="flex items-center space-x-2.5">
        <Check className="h-4 w-4 text-indigo-900 flex-shrink-0" />
        <span className="text-sm text-gray-700">Open access by default</span>
      </div>
    </div>
    
    <Button 
      variant="outlined" 
      size="default"
      className="w-full justify-center text-indigo-500 border-indigo-500 hover:text-indigo-600 hover:bg-indigo-100 font-medium"
    >
      Learn more
    </Button>
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
    <div className="">
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
  <div>
    <InfoBanner />
    <WhoToFollow />
  </div>
);
