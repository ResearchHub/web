'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormField,
  getProfileInformationSchema,
  ProfileInformationFormValues,
  ALL_PROFILE_FIELDS,
} from './schema';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { OnboardingEducationSection } from '../OnboardingEducationSection';
import { OnboardingEducationModal } from '../OnboardingEducationModal';
import type { EducationEntry } from '../OnboardingWizard';
import { faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faShareNodes, faUser } from '@fortawesome/pro-solid-svg-icons';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { useUser } from '@/contexts/UserContext';
import { ImageUploadModal } from '@/components/modals/ImageUploadModal';
import { useUpdateAuthorProfileImage } from '@/hooks/useAuthor';
import toast from 'react-hot-toast';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';

interface ProfileInformationFormProps {
  onSubmit: (data: ProfileInformationFormValues) => void;
  fields?: FormField[];
  formId?: string;
  showAvatar?: boolean;
  useAccordion?: boolean;
  autoFocusField?: FormField;
}

export function ProfileInformationForm({
  onSubmit,
  fields = ALL_PROFILE_FIELDS,
  formId,
  showAvatar = true,
  useAccordion = false,
  autoFocusField,
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

  const { user } = useUser();

  const authorProfile = user?.authorProfile;

  const methods = useForm<ProfileInformationFormValues>({
    resolver: zodResolver(getProfileInformationSchema({ fields })),
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

  const [{ isLoading: isUploadingAvatar }, updateAuthorProfileImage] =
    useUpdateAuthorProfileImage();

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    watch,
    getValues,
    setFocus,
  } = methods;

  useEffect(() => {
    register('education');
  }, [register]);

  const { ref: headlineRef, ...headlineRest } = register('headline');

  // Education state and handlers
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [activeEducationIndex, setActiveEducationIndex] = useState<number | null>(null);

  const education = watch('education') || [];

  const educationValue = watch('education');
  useEffect(() => {}, [educationValue]);

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

  const handleAvatarSave = async (blob: Blob) => {
    try {
      if (user?.authorProfile?.id) {
        await updateAuthorProfileImage(user.authorProfile.id, blob);
      }

      // local preview:
      const imageUrl = URL.createObjectURL(blob);
      setAvatar(imageUrl);
      setIsAvatarModalOpen(false);
    } catch (error) {
      toast.error('Error saving avatar');
    }
  };

  // Create a function to render the field sections
  const renderFieldSections = () => {
    const sections = [];

    // About section
    if (fields.includes('description')) {
      const aboutContent = (
        <Textarea
          {...register('description')}
          error={errors.description?.message}
          placeholder="Tell us a bit about your research interests or background..."
        />
      );

      sections.push({
        id: 'about',
        title: (
          <>
            <span className="flex items-baseline gap-2 text-base">
              <FontAwesomeIcon icon={faUser} />
              About <span className="text-gray-400 text-xs">(Optional)</span>
            </span>
            <span className="text-gray-500 text-sm">
              Let others know about you and your experience.
            </span>
          </>
        ),
        content: aboutContent,
        defaultOpen: Boolean(watch('description')),
      });
    }

    // Education section
    if (fields.includes('education')) {
      const educationContent = (
        <OnboardingEducationSection
          education={education}
          onAdd={handleAddEducation}
          onEdit={handleEditEducation}
          onRemove={handleRemoveEducation}
          onSetMain={setEducationAsMain}
        />
      );

      sections.push({
        id: 'education',
        title: (
          <>
            <span className="flex items-baseline gap-2 text-base">
              <FontAwesomeIcon icon={faGraduationCap} />
              Education <span className="text-gray-400 text-xs">(Optional)</span>
            </span>
            <span className="text-gray-500 text-sm">Add your educational experience.</span>
          </>
        ),
        content: educationContent,
        defaultOpen: Array.isArray(watch('education')) && watch('education').length > 0,
      });
    }

    // Social links section
    if (fields.includes('social_links')) {
      const socialContent = (
        <div>
          <div className="space-y-3">
            {(Object.keys(socialLinkMeta) as Array<keyof typeof socialLinkMeta>).map((key) => {
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
            })}
          </div>
        </div>
      );

      sections.push({
        id: 'social',
        title: (
          <>
            <span className="flex items-baseline gap-2 text-base">
              <FontAwesomeIcon icon={faShareNodes} />
              Social Presence <span className="text-gray-400 text-xs">(Optional)</span>
            </span>
            <span className="text-gray-500 text-sm">Add links to your social profiles.</span>
          </>
        ),
        content: socialContent,
        defaultOpen:
          Boolean(watch('linkedin')) ||
          Boolean(watch('orcid_id')) ||
          Boolean(watch('twitter')) ||
          Boolean(watch('google_scholar')),
      });
    }

    // Render sections based on useAccordion flag
    if (useAccordion) {
      return (
        <Accordion>
          {sections.map((section) => (
            <AccordionItem key={section.id} title={section.title} defaultOpen={section.defaultOpen}>
              {section.content}
            </AccordionItem>
          ))}
        </Accordion>
      );
    } else {
      // Render sections directly
      return (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id}>
              <div className="mb-4">{section.title}</div>
              {section.content}
            </div>
          ))}
        </div>
      );
    }
  };

  useEffect(() => {
    switch (autoFocusField) {
      case 'headline':
        setFocus('headline');
        break;
      case 'first_name':
        setFocus('first_name');
        break;
      case 'description':
        setFocus('description');
        break;
      default:
        break;
    }
  }, [autoFocusField, setFocus]);

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

      <div className={`flex flex-col gap-8 items-start`}>
        {/* Avatar */}
        {showAvatar && (
          <div
            className={`flex flex-col items-center mx-auto`}
            style={{ width: 120, minWidth: 120 }}
          >
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
        )}

        {/* The rest of the form */}
        <div className={`flex-1 w-full`}>
          <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col sm:!flex-row gap-4">
              {fields.includes('first_name') && (
                <div className="w-full sm:!w-1/2">
                  <Input
                    label="First Name"
                    {...register('first_name')}
                    error={errors.first_name?.message}
                    required
                  />
                </div>
              )}
              {fields.includes('last_name') && (
                <div className="w-full sm:!w-1/2">
                  <Input
                    label="Last Name"
                    {...register('last_name')}
                    error={errors.last_name?.message}
                    required
                  />
                </div>
              )}
            </div>
            {fields.includes('headline') && (
              <Input
                label="Headline"
                {...headlineRest}
                ref={headlineRef}
                error={errors.headline?.message}
                helperText="e.g., ML Researcher at Rice University"
              />
            )}

            {/* Render accordion or direct sections */}
            {renderFieldSections()}
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
