import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faGoogle, faOrcid } from '@fortawesome/free-brands-svg-icons';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { AuthorProfile } from '@/types/authorProfile';

interface ProfileSocialLinksProps {
  author: AuthorProfile;
}

export function ProfileSocialLinks({ author }: ProfileSocialLinksProps) {
  return (
    <div className="flex gap-3 justify-start">
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
