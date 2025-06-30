import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faBluesky } from '@fortawesome/free-brands-svg-icons';
import { Link, Check } from 'lucide-react';
import { useState } from 'react';
import { ShareAction, SHARE_CONFIGS } from '@/components/modals/ShareModal'; // adjust import as needed
import AnalyticsService, { LogEvent, LogEventValue } from '@/services/analytics.service';

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

  const buildUrlWithUtm = (baseUrl: string, source: 'linkedin' | 'x' | 'bluesky') => {
    try {
      const urlWithUtm = new URL(baseUrl, window.location.origin);
      urlWithUtm.searchParams.set('utm_source', source);
      urlWithUtm.searchParams.set('utm_medium', 'social_share');
      return urlWithUtm.toString();
    } catch (error) {
      console.error('Failed to construct URL with UTM params', error);
      return baseUrl;
    }
  };

  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText)}&url=${encodeURIComponent(buildUrlWithUtm(url, 'x'))}`;
  const linkedInLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildUrlWithUtm(url, 'linkedin'))}`;
  const blueSkyLink = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${socialText} ${buildUrlWithUtm(url, 'bluesky')}`)}`;

  const handleShare = (platform: 'linkedin' | 'x' | 'bluesky' | 'copy') => {
    let event: LogEventValue | null = null;
    let shareUrl: string | null = null;

    switch (platform) {
      case 'copy':
        event = LogEvent.CLICKED_SHARE_VIA_URL;
        break;
      case 'linkedin':
        event = LogEvent.CLICKED_SHARE_VIA_LINKEDIN;
        shareUrl = linkedInLink;
        break;
      case 'x':
        event = LogEvent.CLICKED_SHARE_VIA_X;
        shareUrl = twitterLink;
        break;
      case 'bluesky':
        event = LogEvent.CLICKED_SHARE_VIA_BLUESKY;
        shareUrl = blueSkyLink;
        break;
    }

    if (event) {
      AnalyticsService.logEvent(event, { action, docTitle, url });
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
                onClick={() => handleShare('copy')}
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
          onClick={() => handleShare('linkedin')}
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
          onClick={() => handleShare('x')}
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
          onClick={() => handleShare('bluesky')}
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
