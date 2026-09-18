import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faGoogle, faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faBirthdayCake } from '@fortawesome/pro-light-svg-icons';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Tooltip } from '@/components/ui/Tooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { AuthorProfile } from '@/types/authorProfile';
import { specificTimeSince, MEMBERSHIP_JUST_JOINED } from '@/utils/date';

interface ProfileSocialLinksProps {
  readonly author: AuthorProfile;
}

export function ProfileSocialLinks({ author }: ProfileSocialLinksProps) {
  const membershipDuration = author.createdDate && specificTimeSince(author.createdDate);
  const membershipLabel =
    membershipDuration &&
    (membershipDuration === MEMBERSHIP_JUST_JOINED
      ? 'Member just joined'
      : `Member for ${membershipDuration}`);

  return (
    <div className="flex items-center gap-3 justify-center [&>*]:flex [&>*]:items-center">
      {membershipLabel && (
        <Tooltip content={membershipLabel} position="top" width="w-72" wrapperClassName="py-2">
          <button
            type="button"
            aria-label={membershipLabel}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faBirthdayCake} className="h-6 w-6" />
          </button>
        </Tooltip>
      )}
      <div className="py-2" title={author.isVerified ? undefined : 'Not verified'}>
        <VerifiedBadge
          size="lg"
          showTooltip={author.isVerified}
          className={author.isVerified ? undefined : 'cursor-not-allowed [&>svg]:text-gray-300'}
        />
      </div>
      <SocialIcon
        icon={<FontAwesomeIcon icon={faLinkedin} className="h-6 w-6" />}
        href={author.linkedin}
        label="LinkedIn"
        className={
          author.linkedin ? '[&>svg]:text-[#0077B5] [&>svg]:hover:text-[#005582] px-0' : 'px-0'
        }
      />
      <SocialIcon
        icon={<FontAwesomeIcon icon={faGoogle} className="h-6 w-6" />}
        href={author.googleScholar}
        label="Google Scholar"
        className={
          author.googleScholar ? '[&>svg]:text-[#4285F4] [&>svg]:hover:text-[#21429F] px-0' : 'px-0'
        }
      />
      <SocialIcon
        icon={<FontAwesomeIcon icon={faOrcid} className="h-6 w-6" />}
        href={author.isOrcidConnected ? author.orcidId : null}
        label="ORCID"
        className={
          author.isOrcidConnected
            ? '[&>svg]:text-orcid-500 [&>svg]:hover:text-orcid-600 px-0'
            : 'px-0'
        }
      />
      <SocialIcon
        icon={<FontAwesomeIcon icon={faXTwitter} className="h-6 w-6" />}
        href={author.twitter}
        label="Twitter"
        className={author.twitter ? '[&>svg]:text-[#000] [&>svg]:hover:text-[#000] px-0' : 'px-0'}
      />
    </div>
  );
}
