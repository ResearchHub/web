import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faBluesky } from '@fortawesome/free-brands-svg-icons';
import { ShareAction, SHARE_CONFIGS } from '@/components/modals/ShareModal'; // adjust import as needed

interface SocialShareButtonsProps {
  action: ShareAction;
  docTitle: string;
  url: string;
}

export function SocialShareButtons({ action, docTitle, url }: SocialShareButtonsProps) {
  const config = SHARE_CONFIGS[action];
  const socialText = config.socialText(docTitle);

  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText)}&url=${encodeURIComponent(url)}`;
  const linkedInLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const blueSkyLink = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${socialText} ${url}`)}`;

  return (
    <div className="mt-2 grid grid-cols-3 gap-3">
      <Button
        variant="outlined"
        className="w-full"
        onClick={() => window.open(linkedInLink, '_blank')}
      >
        <FontAwesomeIcon icon={faLinkedin} size="lg" />
      </Button>
      <Button
        variant="outlined"
        className="w-full"
        onClick={() => window.open(twitterLink, '_blank')}
      >
        <FontAwesomeIcon icon={faXTwitter} size="lg" />
      </Button>
      <Button
        variant="outlined"
        className="w-full"
        onClick={() => window.open(blueSkyLink, '_blank')}
      >
        <FontAwesomeIcon icon={faBluesky} size="lg" />
      </Button>
    </div>
  );
}

export default SocialShareButtons;
