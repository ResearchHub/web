import Image from 'next/image';
import Link from 'next/link';
import type { FeedGrantContent } from '@/types/feed';
import { GRANT_IMAGE_FALLBACK_GRADIENT } from '@/types/grant';
import { formatCompactAmount } from '@/utils/currency';
import { buildWorkUrl } from '@/utils/url';
import { cn } from '@/utils/styles';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';

/** The largest open RFPs as photo cards, the first one twice the size. */
export function GivingTuesdayRfps({ rfps }: { rfps: FeedGrantContent[] }) {
  if (!rfps.length) return null;
  return (
    <section className="px-5 pt-16 lg:px-7 lg:pt-20">
      <div className="mx-auto max-w-[1180px]">
        <h2
          className="text-[28px] font-bold tracking-tight text-navy lg:text-[36px]"
          style={DISPLAY_FONT}
        >
          Open RFPs you can give to
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rfps.map((rfp, index) => (
            <RfpPhotoCard key={rfp.id} rfp={rfp} isFeatured={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RfpPhotoCard({ rfp, isFeatured }: { rfp: FeedGrantContent; isFeatured: boolean }) {
  const raisedUsd = rfp.grant.fundingPool?.amountRaised.usd ?? 0;
  return (
    <Link
      href={buildWorkUrl({ id: rfp.id, contentType: 'funding_request', slug: rfp.slug })}
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded-2xl text-white',
        isFeatured ? 'min-h-[440px] sm:col-span-2 lg:row-span-2' : 'min-h-[300px]'
      )}
      style={{ background: GRANT_IMAGE_FALLBACK_GRADIENT }}
    >
      {rfp.previewImage && (
        <Image
          src={rfp.previewImage}
          alt=""
          fill
          sizes={isFeatured ? '640px' : '400px'}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-navy">
        {formatCompactAmount(rfp.grant.amount.usd)} RFP
      </span>
      <div className="relative p-5">
        <p className="text-sm text-white/75">{rfp.grant.organization}</p>
        <h3
          className={cn('mt-1 font-semibold leading-snug', isFeatured ? 'text-[28px]' : 'text-lg')}
          style={isFeatured ? DISPLAY_FONT : undefined}
        >
          {rfp.grant.shortTitle || rfp.title}
        </h3>
        {raisedUsd > 0 && (
          <p className="mt-2 text-sm text-white/75">
            + {formatCompactAmount(raisedUsd)} from donors
          </p>
        )}
        <span className="mt-4 flex h-10 items-center justify-center rounded-lg bg-white text-sm font-semibold text-navy group-hover:bg-gray-100">
          Give to this RFP
        </span>
      </div>
    </Link>
  );
}
