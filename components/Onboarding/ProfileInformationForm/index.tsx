import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProfileInformationSchema, ProfileInformationFormValues } from './schema';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { OnboardingEducationSection } from '../OnboardingEducationSection';
import { OnboardingEducationModal } from '../OnboardingEducationModal';
import type { EducationEntry } from '../OnboardingWizard';
import { faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { useUser } from '@/contexts/UserContext';
import { ImageUploadModal } from '@/components/modals/ImageUploadModal';
import { useUpdateAuthorProfileImage } from '@/hooks/useAuthor';
interface ProfileInformationFormProps {
  onSubmit: (data: ProfileInformationFormValues) => void;
  simplifiedView?: boolean;
  submitLabel?: string;
  loading?: boolean;
}

export function ProfileInformationForm({
  onSubmit,
  simplifiedView = false,
  submitLabel = 'Save',
  loading = false,
}: ProfileInformationFormProps) {
  const socialLinkMeta = {
    linkedin: {
      icon: <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5 text-[#0077B5]" />,
      label: 'LinkedIn Profile URL',
    },
    orcid_id: {
      icon: <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 text-[#A6CE39]" />,
      label: 'ORCID URL',
    },
    twitter: {
      icon: <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5 text-[#000]" />,
      label: 'X (Twitter) Profile URL',
    },
    google_scholar: {
      icon: <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 text-[#4285F4]" />,
      label: 'Google Scholar Profile URL',
    },
  } as const;

  const { user, refreshUser } = useUser();

  const authorProfile = user?.authorProfile;

  const methods = useForm<ProfileInformationFormValues>({
    resolver: zodResolver(getProfileInformationSchema(simplifiedView)),
    mode: 'onChange',
    defaultValues: {
      education: authorProfile?.education || [],
      first_name: authorProfile?.firstName || '',
      last_name: authorProfile?.lastName || '',
      headline: authorProfile?.headline || '',
      description: authorProfile?.description || '',
      linkedin: authorProfile?.linkedin || '',
      orcid_id: authorProfile?.orcidId || '',
      twitter: authorProfile?.twitter || '',
      google_scholar: authorProfile?.googleScholar || '',
    },
  });

  const [{ isLoading, error }, updateAuthorProfileImage] = useUpdateAuthorProfileImage();

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    watch,
  } = methods;

  // Education state and handlers
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [activeEducationIndex, setActiveEducationIndex] = useState<number | null>(null);

  const education = watch('education') || [];

  const handleAddEducation = () => {
    setActiveEducationIndex(education.length);
    setIsEducationModalOpen(true);
  };

  const handleEditEducation = (index: number) => {
    setActiveEducationIndex(index);
    setIsEducationModalOpen(true);
  };

  const handleRemoveEducation = (index: number) => {
    const newEducation = education.filter((_, i) => i !== index);
    setValue('education', newEducation, { shouldValidate: true });
  };

  const handleSaveEducation = (educationEntry: EducationEntry) => {
    const newEducation = [...education];
    if (activeEducationIndex !== null) {
      newEducation[activeEducationIndex] = {
        ...educationEntry,
        university: educationEntry.university ?? undefined,
      };
      setValue('education', newEducation, { shouldValidate: true });
    }
    setIsEducationModalOpen(false);
  };

  const setEducationAsMain = (index: number) => {
    const newEducation = education.map((edu: EducationEntry, i: number) => ({
      ...edu,
      is_public: i === index,
      university: edu.university ?? undefined,
    }));
    setValue('education', newEducation, { shouldValidate: true });
  };

  // Watch all social link fields
  const socialLinks = {
    google_scholar: watch('google_scholar'),
    linkedin: watch('linkedin'),
    orcid_id: watch('orcid_id'),
    twitter: watch('twitter'),
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.name as keyof ProfileInformationFormValues, e.target.value, {
      shouldValidate: true,
    });
  };

  // Avatar state and handlers
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.authorProfile?.profileImage || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarSave = async (blob: Blob) => {
    setIsUploadingAvatar(true);
    try {
      if (user?.authorProfile?.id) {
        await updateAuthorProfileImage(user.authorProfile.id, blob);
      } else {
        console.error('User profile ID not available. Cannot save avatar.');
      }

      // If you want to just use a local preview:
      const imageUrl = URL.createObjectURL(blob);
      setAvatar(imageUrl);
      //   await refreshUser(); // Refresh user data to get updated avatar URL
      setIsAvatarModalOpen(false);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <FormProvider {...methods}>
      {/* Education Modal */}
      {/* TODO make the Year field required */}
      <OnboardingEducationModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        education={education[activeEducationIndex ?? 0] || {}}
        onSave={handleSaveEducation}
        setAsMain={() => setEducationAsMain(activeEducationIndex ?? 0)}
      />

      {/* Avatar modal */}
      <ImageUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={handleAvatarSave}
        isLoading={isUploadingAvatar}
      />

      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        {/* Left column: Avatar */}
        <div className="flex flex-col items-center" style={{ width: 120, minWidth: 120 }}>
          <div
            className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 overflow-hidden"
            onClick={() => setIsAvatarModalOpen(true)}
            title="Click to upload avatar"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">Upload Photo</span>
            )}
          </div>
          <Button variant="link" onClick={() => setIsAvatarModalOpen(true)} className="text-sm">
            {avatar ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </div>

        {/* Right column: The rest of the form */}
        <div className="flex-1 w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <Input
                  label="First Name"
                  {...register('first_name')}
                  error={errors.first_name?.message}
                  required
                />
              </div>
              <div className="w-full sm:w-1/2">
                <Input
                  label="Last Name"
                  {...register('last_name')}
                  error={errors.last_name?.message}
                  required
                />
              </div>
            </div>
            <Input
              label="Headline"
              {...register('headline')}
              error={errors.headline?.message}
              helperText="e.g., PhD Student at Uni X, Software Engineer"
            />

            {!simplifiedView && (
              <>
                <Textarea
                  label="About"
                  {...register('description')}
                  error={errors.description?.message}
                  placeholder="Tell us a bit about your research interests or background..."
                />
                {/* Education Section */}
                <OnboardingEducationSection
                  education={education}
                  onAdd={handleAddEducation}
                  onEdit={handleEditEducation}
                  onRemove={handleRemoveEducation}
                  onSetMain={setEducationAsMain}
                />
                <div>
                  <h3 className="text-md font-medium text-gray-600 mb-3">Social Links</h3>
                  <div className="space-y-3">
                    {(Object.keys(socialLinkMeta) as Array<keyof typeof socialLinkMeta>).map(
                      (key) => {
                        const meta = socialLinkMeta[key];
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <SocialIcon
                              icon={meta.icon}
                              label={meta.label}
                              href={null}
                              size="sm"
                              className="text-gray-500"
                            />
                            <Input
                              id={key}
                              name={key}
                              value={socialLinks[key] || ''}
                              onChange={handleSocialLinkChange}
                              error={errors[key]?.message}
                              placeholder={meta.label}
                              className="flex-grow"
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : submitLabel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
