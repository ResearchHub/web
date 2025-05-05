import { User } from '@/types/user';

export enum ProfileField {
  Name = 'name',
  Photo = 'photo',
  Headline = 'headline',
  //   Verification = 'verification',
  Education = 'education',
  About = 'about',
  Social = 'social',
}

export const PROFILE_FIELD_WEIGHTS: Record<ProfileField, number> = {
  [ProfileField.Name]: 15,
  [ProfileField.Photo]: 15,
  [ProfileField.Headline]: 20,
  //   [ProfileField.Verification]: 25, //TODO: remove it from the calculation for now until the is_verified is fixed
  [ProfileField.Education]: 20,
  [ProfileField.About]: 15,
  [ProfileField.Social]: 15,
};

export function calculateProfileCompletion(user: User): {
  percent: number;
  missing: ProfileField[];
  status: 'complete' | 'incomplete' | 'partial';
} {
  let percent = 0;
  const missing: ProfileField[] = [];

  // Name (first and last)
  if (user.firstName && user.lastName) percent += PROFILE_FIELD_WEIGHTS[ProfileField.Name];
  else missing.push(ProfileField.Name);

  // Photo
  if (user.authorProfile?.profileImage) percent += PROFILE_FIELD_WEIGHTS[ProfileField.Photo];
  else missing.push(ProfileField.Photo);

  // Headline
  if (user.authorProfile?.headline) percent += PROFILE_FIELD_WEIGHTS[ProfileField.Headline];
  else missing.push(ProfileField.Headline);

  // Verification
  // if (user.isVerified) percent += PROFILE_FIELD_WEIGHTS[ProfileField.Verification];
  // else missing.push(ProfileField.Verification);

  // Education
  if (user.authorProfile?.education && user.authorProfile.education.length > 0)
    percent += PROFILE_FIELD_WEIGHTS[ProfileField.Education];
  else missing.push(ProfileField.Education);

  // About/Description
  if (user.authorProfile?.description) percent += PROFILE_FIELD_WEIGHTS[ProfileField.About];
  else missing.push(ProfileField.About);

  // Social accounts (at least one)
  const social =
    user.authorProfile?.linkedin ||
    user.authorProfile?.twitter ||
    user.authorProfile?.orcidId ||
    user.authorProfile?.googleScholar;
  if (social) percent += PROFILE_FIELD_WEIGHTS[ProfileField.Social];
  else missing.push(ProfileField.Social);

  let status: 'complete' | 'incomplete' | 'partial';
  if (percent === 100) status = 'complete';
  else if (percent === 0) status = 'incomplete';
  else status = 'partial';

  return { percent, missing, status };
}
