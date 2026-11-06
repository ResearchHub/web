import { Ban, FlaskConical, HandCoins, Users, FileText, type LucideIcon } from 'lucide-react';

type PublishGuidelinesVariant = 'default' | 'rfp';

/** A work cannot be published under a shorter title. */
export const MIN_PUBLISH_TITLE_LENGTH = 20;

interface GuidelineItem {
  icon: LucideIcon;
  text: string;
}

interface GuidelineConfig {
  heading: string;
  items: GuidelineItem[];
}

/** What an author agrees to when publishing. */
const PUBLISH_GUIDELINES: Record<PublishGuidelinesVariant, GuidelineConfig> = {
  default: {
    heading: 'Guidelines for posts',
    items: [
      { icon: FlaskConical, text: 'Stick to scientific topics' },
      { icon: Ban, text: 'Don’t post illegal content or spam' },
      { icon: Users, text: 'Be respectful of differing opinions, viewpoints, and experiences' },
      { icon: FileText, text: 'Do not plagiarize any content, keep it original' },
    ],
  },
  rfp: {
    heading: 'Guidelines for Requests for Proposals',
    items: [
      {
        icon: HandCoins,
        text: 'Only create an RFP if you intend to distribute the stated funding amount.',
      },
      { icon: FileText, text: 'Describe the scope and expectations of your RFP clearly.' },
      { icon: FlaskConical, text: 'Stick to truth-seeking science.' },
    ],
  },
};

/** The guidelines an author agrees to, as a gray box: a heading and the list. */
export function PublishGuidelines({ variant }: { readonly variant: PublishGuidelinesVariant }) {
  const guidelines = PUBLISH_GUIDELINES[variant];
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <h4 className="mb-3 text-sm font-medium text-gray-900">{guidelines.heading}</h4>
      <ul className="space-y-3">
        {guidelines.items.map((item) => (
          <li key={item.text} className="flex items-start gap-2">
            <item.icon
              className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-gray-600"
              strokeWidth={2}
            />
            <span className="text-sm text-gray-600">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
