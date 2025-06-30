import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faBluesky } from '@fortawesome/free-brands-svg-icons';
import { ShareAction, SHARE_CONFIGS } from '@/components/modals/ShareModal';
import { Link, Check } from 'lucide-react';
import { useState } from 'react';

interface SocialShareButtonsProps {
  action: ShareAction;
  docTitle: string;
  url: string;
  showCopyButton?: boolean;
}

export function SocialShareButtons({
  action,
  docTitle,
  url,
  showCopyButton = false,
}: SocialShareButtonsProps) {
  const config = SHARE_CONFIGS[action];
  const socialText = config.socialText(docTitle);
  const [copied, setCopied] = useState(false);

  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText)}&url=${encodeURIComponent(url)}`;
  const linkedInLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const blueSkyLink = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${socialText} ${url}`)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buttons = [
    ...(showCopyButton
      ? [
          {
            key: 'copy',
            component: (
              <Button
                key="copy"
                variant="outlined"
                className="w-full relative"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                {copied && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded">
                    Copied!
                  </span>
                )}
              </Button>
            ),
          },
        ]
      : []),
    {
      key: 'linkedin',
      component: (
        <Button
          key="linkedin"
          variant="outlined"
          className="w-full"
          onClick={() => window.open(linkedInLink, '_blank')}
        >
          <FontAwesomeIcon icon={faLinkedin} size="lg" />
        </Button>
      ),
    },
    {
      key: 'twitter',
      component: (
        <Button
          key="twitter"
          variant="outlined"
          className="w-full"
          onClick={() => window.open(twitterLink, '_blank')}
        >
          <FontAwesomeIcon icon={faXTwitter} size="lg" />
        </Button>
      ),
    },
    {
      key: 'bluesky',
      component: (
        <Button
          key="bluesky"
          variant="outlined"
          className="w-full"
          onClick={() => window.open(blueSkyLink, '_blank')}
        >
          <FontAwesomeIcon icon={faBluesky} size="lg" />
        </Button>
      ),
    },
  ];

  return (
    <div className={`mt-2 grid gap-3 w-full ${showCopyButton ? 'grid-cols-4' : 'grid-cols-3'}`}>
      {buttons.map((button) => button.component)}
    </div>
  );
}

export default SocialShareButtons;
