'use client';

import { FC } from 'react';
import {
  GrantSummary,
  StoryUpdate,
  getPrimaryStory,
  getSecondaryStories,
  formatStoryDate,
} from './mockData';
import { cn } from '@/utils/styles';
import { ArrowRight, ChevronRight, ExternalLink, Globe, Music } from 'lucide-react';

interface GrantNewsSectionProps {
  grant: GrantSummary;
  onViewMore: (grantId: number) => void;
}

// ─── Source label with icon on top ────────────────────────────────

const SourceLabel: FC<{ sourceType: StoryUpdate['sourceType']; source: string }> = ({
  sourceType,
  source,
}) => {
  switch (sourceType) {
    case 'x':
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-900 text-white text-[10px] font-black leading-none">
            𝕏
          </span>
          <span className="text-[11px] font-semibold text-gray-500">x.com</span>
        </div>
      );
    case 'linkedin':
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#0A66C2] text-white text-[9px] font-extrabold leading-none">
            in
          </span>
          <span className="text-[11px] font-semibold text-gray-500">linkedin.com</span>
        </div>
      );
    case 'tiktok':
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-900 text-white">
            <Music size={11} />
          </span>
          <span className="text-[11px] font-semibold text-gray-500">tiktok.com</span>
        </div>
      );
    default:
      // All other sources (media, publication, instagram, etc.) — Globe + source name
      return (
        <div className="flex items-center gap-1.5">
          <Globe size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-gray-500">{source}</span>
        </div>
      );
  }
};

// ─── TikTok Embed ─────────────────────────────────────────────────

const TikTokEmbed: FC<{ videoId: string }> = ({ videoId }) => {
  return (
    <div className="flex items-center justify-center h-full min-h-[500px] bg-gray-950 overflow-hidden">
      <iframe
        src={`https://www.tiktok.com/player/v1/${videoId}?rel=0`}
        width="325"
        height="580"
        allowFullScreen
        allow="encrypted-media"
        frameBorder="0"
        title="TikTok Video"
        className="rounded-lg"
      />
    </div>
  );
};

// ─── LinkedIn Embed ───────────────────────────────────────────────

const LinkedInEmbed: FC<{ url: string; maxHeight?: number; scale?: number }> = ({
  url,
  maxHeight = 500,
  scale = 1.15,
}) => {
  // Scale the iframe up and use negative margins to clip LinkedIn's internal card border
  const border = 8;
  return (
    <div className="bg-white overflow-hidden" style={{ maxHeight }}>
      <div
        className="overflow-hidden"
        style={{ margin: `-${border}px -${border}px 0 -${border}px` }}
      >
        <iframe
          src={`https://www.linkedin.com/embed/feed/update/urn:li:activity:${url.match(/activity-(\d+)/)?.[1] || ''}`}
          height={Math.round((maxHeight + 120 + border * 2) / scale)}
          width={`${Math.round((100 + (border * 2 * 100) / 500) / scale)}%`}
          frameBorder="0"
          allowFullScreen
          title="LinkedIn Post"
          style={{
            border: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
};

// ─── Primary Story Card ──────────────────────────────────────────

const PrimaryStoryCard: FC<{ story: StoryUpdate }> = ({ story }) => {
  if (story.embedType === 'tiktok' && story.embedId) {
    return (
      <div className="relative">
        <TikTokEmbed videoId={story.embedId} />
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <SourceLabel sourceType={story.sourceType} source={story.source} />
            <span className="text-[11px] text-gray-500">{formatStoryDate(story.date)}</span>
          </div>
          <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
            {story.headline}
          </p>
        </div>
      </div>
    );
  }

  if (story.embedType === 'linkedin') {
    return (
      <div className="relative">
        <LinkedInEmbed url={story.url} />
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <SourceLabel sourceType={story.sourceType} source={story.source} />
            <span className="text-[11px] text-gray-500">{formatStoryDate(story.date)}</span>
          </div>
          <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
            {story.headline}
          </p>
        </div>
      </div>
    );
  }

  // Default: image/gradient card
  return (
    <a
      href={story.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative rounded-xl overflow-hidden bg-gray-900 h-full min-h-[280px]"
    >
      {story.imageUrl ? (
        <img
          src={story.imageUrl}
          alt={story.headline}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-300"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.5) 0%, transparent 50%), ' +
              'radial-gradient(ellipse at 70% 60%, rgba(59,130,246,0.4) 0%, transparent 45%), ' +
              'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="relative h-full flex flex-col justify-end p-5">
        <div className="flex items-center gap-2 mb-2">
          <SourceLabel sourceType={story.sourceType} source={story.source} />
          <span className="text-[11px] text-white/60">{formatStoryDate(story.date)}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight mb-1.5 group-hover:text-primary-200 transition-colors line-clamp-3">
          {story.headline}
        </h3>
        {story.excerpt && (
          <p className="text-[13px] text-white/70 leading-relaxed line-clamp-2">{story.excerpt}</p>
        )}
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink size={16} className="text-white/70" />
      </div>
    </a>
  );
};

// ─── Secondary Story Row ──────────────────────────────────────────

const SecondaryStoryRow: FC<{ story: StoryUpdate; isLast: boolean }> = ({ story, isLast }) => (
  <a
    href={story.url}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      'block py-2.5 px-1 group hover:bg-gray-50 rounded-lg transition-colors -mx-1',
      !isLast && 'border-b border-gray-100'
    )}
  >
    {/* Source label on top */}
    <SourceLabel sourceType={story.sourceType} source={story.source} />

    {/* Headline */}
    <p className="text-[13px] font-semibold text-gray-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2 mt-1">
      {story.headline}
    </p>

    {/* Time */}
    <span className="text-[11px] text-gray-500 mt-0.5 block">{formatStoryDate(story.date)}</span>
  </a>
);

// ─── Main Section ─────────────────────────────────────────────────

export const GrantNewsSection: FC<GrantNewsSectionProps> = ({ grant, onViewMore }) => {
  const primary = getPrimaryStory(grant);
  const secondary = getSecondaryStories(grant, primary?.id, 10);
  const hasStories = primary || secondary.length > 0;
  const isLinkedInPrimary = primary?.embedType === 'linkedin';
  const isEmbedPrimary = primary?.embedType === 'tiktok' || isLinkedInPrimary;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Section header — Google News style with chevron */}
      <button
        type="button"
        onClick={() => onViewMore(grant.id)}
        className="flex items-center gap-1 px-5 py-4 border-b border-gray-100 group cursor-pointer w-full text-left"
      >
        <h2 className="text-[18px] font-bold text-primary-700 leading-tight group-hover:underline">
          {grant.shortTitle}
        </h2>
        <ChevronRight size={20} className="text-primary-700 flex-shrink-0 mt-px" />
      </button>

      {/* Stories */}
      {hasStories ? (
        <div className="relative mt-3 px-4">
          {/* Primary story — left side, drives the section height */}
          {primary && (
            <div className="md:w-[55%] pr-3">
              <PrimaryStoryCard story={primary} />
            </div>
          )}

          {/* Secondary stories — right side, absolutely positioned to match left height, scrollable */}
          {secondary.length > 0 && (
            <div className="md:absolute md:top-0 md:bottom-0 md:right-4 md:left-[55%] px-3 py-2 md:overflow-y-auto md:border-l md:border-gray-100">
              {secondary.map((story, i) => (
                <SecondaryStoryRow
                  key={story.id}
                  story={story}
                  isLast={i === secondary.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-[13px] text-gray-400">
          No updates yet. Stories will appear here as proposals gain traction.
        </div>
      )}

      {/* View more footer */}
      <button
        type="button"
        onClick={() => onViewMore(grant.id)}
        className="w-full flex items-center justify-center gap-1.5 px-5 py-3 border-t border-gray-100 text-[13px] font-semibold text-primary-600 hover:bg-primary-50/50 transition-colors cursor-pointer"
      >
        View more
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
