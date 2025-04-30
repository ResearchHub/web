'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { ProfileInformationForm } from '@/components/Onboarding/ProfileInformationForm';
import { ProfileInformationFormValues } from '@/components/Onboarding/ProfileInformationForm/schema';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Pencil, X } from 'lucide-react';
import { useAuthorInfo, useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import { User } from '@/types/user';
import { useUser } from '@/contexts/UserContext';
import { Avatar } from '@/components/ui/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { SocialIcon } from '@/components/ui/SocialIcon';

function toNumberOrNull(value: any): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function AuthorProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="h-9 bg-gray-200 rounded w-48 mb-3" /> {/* Title placeholder */}
          <div className="h-5 bg-gray-200 rounded w-64" /> {/* Headline placeholder */}
        </div>
        <div className="w-28 h-10 bg-gray-200 rounded" /> {/* Button placeholder */}
      </div>

      {/* Profile content */}
      <div className="flex items-start gap-8">
        {/* Avatar skeleton */}
        <div className="w-28 h-28 bg-gray-200 rounded-full flex-shrink-0" />

        {/* Profile info skeleton */}
        <div className="flex-1">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthorProfileError({ error }: { error: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-red-500 text-lg mb-4">Error loading profile</div>
      <div className="text-gray-600">{error}</div>
    </div>
  );
}

function AuthorProfileView({ author, onEdit }: { author: User; onEdit: () => void }) {
  const { user } = useUser();
  const isOwnProfile = user?.authorProfile?.id === author.authorProfile?.id;
  const fullName = `${author.firstName} ${author.lastName}`;

  const socialLinkMeta = {
    linkedin: {
      icon: <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />,
      label: 'LinkedIn',
      url: author.authorProfile?.linkedin,
    },
    orcid_id: {
      icon: <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5" />,
      label: 'ORCID',
      url: author.authorProfile?.orcidId,
    },
    twitter: {
      icon: <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />,
      label: 'X (Twitter)',
      url: author.authorProfile?.twitter,
    },
    google_scholar: {
      icon: <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5" />,
      label: 'Google Scholar',
      url: author.authorProfile?.googleScholar,
    },
  } as const;

  const hasSocialLinks = Object.values(socialLinkMeta).some((link) => link.url);

  const education = author.authorProfile?.education || [];

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
          {author.authorProfile?.headline && (
            <p className="mt-2 text-gray-600">{author.authorProfile.headline}</p>
          )}
        </div>
        {isOwnProfile && (
          <Button onClick={onEdit} variant="outlined" className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex gap-8">
        <div className="flex-shrink-0">
          <Avatar src={author.authorProfile?.profileImage} alt={fullName} size={112} />
        </div>

        <div className="flex-1 space-y-6">
          {author.authorProfile?.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-600">{author.authorProfile.description}</p>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Education</h3>
              <ul className="space-y-2">
                {education.map((edu, idx) => (
                  <li key={idx} className="flex flex-col">
                    {edu.degree && (
                      <span className="font-medium text-gray-800">{edu.degree.label}</span>
                    )}
                    <span className="text-gray-600">
                      {edu.summary || `${edu.degree?.label} in ${edu.major}, ${edu.name}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasSocialLinks && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Social Links</h3>
              <div className="space-y-3">
                {Object.entries(socialLinkMeta).map(([key, { icon, label, url }]) => {
                  if (!url) return null;

                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 inline-block"
                    >
                      <span className="text-gray-500">{icon}</span>
                      <span>{label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isEditing, setIsEditing] = useState(false);
  const { user, isLoading: isUserLoading, error: userError, refreshUser } = useUser();
  const authorId = toNumberOrNull(resolvedParams.id);
  const [{ author, isLoading, error }] = useAuthorInfo(authorId);
  const [
    { isLoading: updateAuthorProfileDataLoading, error: updateAuthorProfileDataError },
    updateAuthorProfileData,
  ] = useUpdateAuthorProfileData();

  const isOwnProfile = user?.authorProfile?.id === author?.authorProfile?.id;

  useEffect(() => {
    if (!isOwnProfile) {
      setIsEditing(false);
    }
  }, [isOwnProfile]);

  const handleSubmit = async (data: ProfileInformationFormValues) => {
    if (!user?.authorProfile?.id) {
      toast.error('User information not available. Cannot save profile.');
      return false;
    }

    const authorId = user.authorProfile.id;
    try {
      await updateAuthorProfileData(authorId, {
        ...data,
        education: data.education.length > 0 ? data.education : undefined,
        description: data.description || undefined,
        headline: data.headline || undefined,
        linkedin: data.linkedin || undefined,
        orcid_id: data.orcid_id || undefined,
        twitter: data.twitter || undefined,
        google_scholar: data.google_scholar || undefined,
      });
      setIsEditing(false);
      refreshUser();
    } catch (e) {
      toast.error('Failed to save profile.');
    }
  };

  if (isLoading || isUserLoading) return <AuthorProfileSkeleton />;
  if (error || userError)
    return <AuthorProfileError error={error || userError?.message || 'Unknown error'} />;
  if (!author) return <AuthorProfileError error="Author not found" />;

  return isEditing && isOwnProfile ? (
    <>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-2 text-gray-600">
            Update your profile information to help others learn more about you.
          </p>
        </div>
        <Button
          type="button"
          variant="outlined"
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
      <ProfileInformationForm
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        loading={updateAuthorProfileDataLoading}
      />
    </>
  ) : (
    <AuthorProfileView author={author} onEdit={() => setIsEditing(true)} />
  );
}
