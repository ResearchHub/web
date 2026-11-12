import Image from 'next/image';
import { cn } from '@/utils/styles';
import type { Topic } from '@/app/giving-tuesday/lib/topics';

type TopicId = Topic['id'];

const PALETTES: Record<TopicId, { deep: string; bright: string }> = {
  ai: { deep: '#0b1a4a', bright: '#3971ff' },
  longevity: { deep: '#03302a', bright: '#10b981' },
  cancer: { deep: '#4c0519', bright: '#f43f5e' },
  neuroscience: { deep: '#2a0653', bright: '#8b5cf6' },
  heart: { deep: '#450a0a', bright: '#ef4444' },
  infections: { deep: '#4a1d04', bright: '#f59e0b' },
  genetics: { deep: '#042f2e', bright: '#14b8a6' },
  environment: { deep: '#052e16', bright: '#22c55e' },
  physics: { deep: '#0f0c33', bright: '#6366f1' },
  chemistry: { deep: '#082f3d', bright: '#06b6d4' },
  other: { deep: '#0b0f19', bright: '#475569' },
};

/**
 * A field's photo, tinted with its own colors. The photos are public domain or CC0, from
 * Wikimedia Commons. It fills its box and crops to fit, and zooms in slowly while the nearest
 * `group` is hovered or focused.
 */
export function TopicArt({
  topicId,
  className,
}: Readonly<{ topicId: TopicId; className?: string }>) {
  const { deep, bright } = PALETTES[topicId];

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ background: `radial-gradient(circle at 72% 25%, ${bright}, ${deep} 95%)` }}
      aria-hidden
    >
      <Image
        src={`/giving-tuesday/topics/${topicId}.jpg`}
        alt=""
        fill
        sizes="(min-width: 1024px) 40vw, 50vw"
        className="object-cover opacity-70 mix-blend-luminosity transition-transform duration-[1400ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.08] group-focus-visible:scale-[1.08] motion-reduce:transition-none"
      />
    </div>
  );
}
