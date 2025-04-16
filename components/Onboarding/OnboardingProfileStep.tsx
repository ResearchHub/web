'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/Button';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { OnboardingEducationSection } from './OnboardingEducationSection'; // Update import name and path
import type { UserProfileData, EducationEntry } from './OnboardingWizard'; // Adjust path if needed

interface OnboardingProfileStepProps {
  // Rename interface
  userData: UserProfileData;
  setUserData: React.Dispatch<React.SetStateAction<UserProfileData>>;
  openAvatarModal: () => void;
  handleAddEducation: () => void;
  handleEditEducation: (index: number) => void;
  handleRemoveEducation: (index: number) => void;
  setEducationAsMain: (index: number) => void;
}

export function OnboardingProfileStep({
  // Rename function
  userData,
  setUserData,
  openAvatarModal,
  handleAddEducation,
  handleEditEducation,
  handleRemoveEducation,
  setEducationAsMain,
}: OnboardingProfileStepProps) {
  // Update interface usage
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prev: UserProfileData) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev: UserProfileData) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  const socialLinkMeta = {
    linkedIn: {
      icon: <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />,
      label: 'LinkedIn Profile URL',
    },
    orcid: {
      icon: <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5" />,
      label: 'ORCID URL',
    },
    twitter: {
      icon: <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />,
      label: 'X (Twitter) Profile URL',
    },
    googleScholar: {
      icon: <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5" />,
      label: 'Google Scholar Profile URL',
    },
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-700">
        First, tell us a little about yourself
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="flex flex-col items-center space-y-3">
          <div
            className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 overflow-hidden"
            onClick={openAvatarModal}
            title="Click to upload avatar"
          >
            {userData.avatar ? (
              <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">Upload Photo</span>
            )}
          </div>
          <Button variant="link" onClick={openAvatarModal} className="text-sm">
            {userData.avatar ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <input
              type="text"
              id="headline"
              name="headline"
              value={userData.headline}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., PhD Student at Uni X, Software Engineer"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              About
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={userData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tell us a bit about your research interests or background..."
            />
          </div>

          {/* Education Section - Using direct handlers */}
          <OnboardingEducationSection
            education={userData.education}
            onAdd={handleAddEducation}
            onEdit={handleEditEducation}
            onRemove={handleRemoveEducation}
            onSetMain={setEducationAsMain}
          />

          <div>
            <h3 className="text-md font-medium text-gray-600 mb-3">Social Links (Optional)</h3>
            <div className="space-y-3">
              {(Object.keys(socialLinkMeta) as Array<keyof typeof socialLinkMeta>).map((key) => {
                const meta = socialLinkMeta[key];
                const value = userData.socialLinks[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <SocialIcon
                      icon={meta.icon}
                      label={meta.label}
                      href={null}
                      size="sm"
                      className="text-gray-500"
                    />
                    <input
                      type="url"
                      id={key}
                      name={key}
                      value={value}
                      onChange={handleSocialLinkChange}
                      className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={meta.label}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
