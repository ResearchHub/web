import { AvatarStack } from '@/components/ui/AvatarStack';
import { cn } from '@/utils/styles';

/** Someone shown by their photo, e.g. a backer or an applicant. */
export interface Face {
  name: string;
  image: string;
  /** Links the face to the author's profile. */
  authorId?: number;
}

/**
 * Photos uploaded to ResearchHub rank first, then any other photo, then none.
 * Google sign-in photos rank second because many are Google's generated
 * letter avatar, which reads as initials.
 */
function photoRank(image: string): number {
  if (!image) return 0;
  return image.includes('googleusercontent.com') ? 1 : 2;
}

interface FaceStackProps {
  faces: Face[];
  /** Everyone, when `faces` holds only the first of them. */
  total?: number;
  /** How many faces to show. */
  max?: number;
  /** Counts the rest in a +N chip, whose list of names this heads, e.g. "Backers". */
  countLabel?: string;
  size?: 'xxs' | 'sm';
  /** The rings between the faces, in the color of what they sit on. */
  ringClassName?: string;
  /** Off when the faces sit inside a control of their own. */
  linked?: boolean;
  className?: string;
}

/** A few overlapping faces, best photos first. */
export function FaceStack({
  faces,
  total = faces.length,
  max = 3,
  countLabel,
  size = 'xxs',
  ringClassName,
  linked = true,
  className,
}: FaceStackProps) {
  // Best photos first, so the visible faces aren't initials while real photos
  // sit further down the list. The sort is stable, so order is otherwise kept.
  const items = [...faces]
    .sort((a, b) => photoRank(b.image) - photoRank(a.image))
    .map((face) => ({
      src: face.image,
      alt: face.name,
      tooltip: face.name,
      authorId: linked ? face.authorId : undefined,
    }));

  return (
    <AvatarStack
      className={cn('shrink-0', className)}
      items={items}
      size={size}
      maxItems={max}
      spacing={size === 'sm' ? -8 : -6}
      ringColorClass={ringClassName}
      showExtraCount={countLabel != null}
      totalItemsCount={total}
      extraCountLabel={countLabel}
      showLabel={false}
    />
  );
}
