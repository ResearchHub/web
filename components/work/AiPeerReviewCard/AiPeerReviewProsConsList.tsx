'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamation } from '@fortawesome/pro-solid-svg-icons';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';

interface ProsConsListProps {
  strengths: string[];
  weaknesses: string[];
  expanded: boolean;
}

const PREVIEW_COUNT = 3;

function splitAtColon(text: string): { head: string; rest: string } {
  const idx = text.indexOf(':');
  if (idx === -1) return { head: text, rest: '' };
  return { head: text.slice(0, idx).trim(), rest: text.slice(idx + 1).trim() };
}

interface ItemRowProps {
  item: string;
  variant: 'pros' | 'cons';
}

function ItemRow({ item, variant }: ItemRowProps) {
  const { head } = splitAtColon(item);
  const hasRest = head !== item;
  const badgeClasses =
    variant === 'pros' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  const icon = variant === 'pros' ? faCheck : faExclamation;

  const textNode = hasRest ? (
    <Tooltip content={item} width="w-80" position="top">
      <span className="cursor-help border-b border-dashed border-gray-300 leading-relaxed">
        {head}
      </span>
    </Tooltip>
  ) : (
    <span className="leading-relaxed">{item}</span>
  );

  return (
    <li className="flex items-start gap-2.5 text-sm text-gray-700">
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
          badgeClasses
        )}
      >
        <FontAwesomeIcon icon={icon} className="h-2.5 w-2.5" />
      </span>
      {textNode}
    </li>
  );
}

interface ListProps {
  title: string;
  items: string[];
  variant: 'pros' | 'cons';
  expanded: boolean;
}

function List({ title, items, variant, expanded }: ListProps) {
  if (items.length === 0) return null;
  const hasMore = items.length > PREVIEW_COUNT;

  return (
    <div>
      <h4 className="mb-2.5 text-sm font-semibold text-gray-900">{title}</h4>
      <ul
        className={cn(
          'space-y-2.5',
          !expanded && hasMore && 'relative max-h-[120px] overflow-hidden'
        )}
      >
        {items.map((item, i) => (
          <ItemRow key={i} item={item} variant={variant} />
        ))}
        {!expanded && hasMore && (
          <li
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white via-white/90 to-transparent"
          />
        )}
      </ul>
    </div>
  );
}

export function AiPeerReviewProsConsList({ strengths, weaknesses, expanded }: ProsConsListProps) {
  if (strengths.length === 0 && weaknesses.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <List title="Pros" items={strengths} variant="pros" expanded={expanded} />
      <List title="Cons" items={weaknesses} variant="cons" expanded={expanded} />
    </div>
  );
}
