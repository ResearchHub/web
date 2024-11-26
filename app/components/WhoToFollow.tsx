const WhoToFollow: React.FC = () => {
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
  
    const ProfileCard = ({ profile }: { profile: any }) => (
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
        <button className="px-3 py-1 border border-indigo-600 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-50">
          Follow
        </button>
      </div>
    );
  
    return (
      <div className="bg-white rounded-xl border p-4">
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