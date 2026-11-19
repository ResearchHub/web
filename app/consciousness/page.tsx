import { ActionDock } from './components/ActionDock';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Phases } from './components/Phases';
import {
  AboutResearchHub,
  Faq,
  OrchFooter,
  Proposals,
  Sources,
  TalkToUs,
} from './components/Process';
import { Questions } from './components/Questions';
import { SetSwitcher } from './components/SetSwitcher';
import { Claim, Timeline } from './components/Story';
import { parseSet } from './theme';
import { parseHero } from './sets/heroes';
import { isCampaignRfp, rfpPostId, rfpView } from './data/rfp';
import { LiveRfpActions } from './components/LiveRfpActions';
import { PostService } from '@/services/post.service';
import type { Work } from '@/types/work';

/**
 * The RFP's post, as the RFP page's layout loads it
 * (`app/rfp/[id]/[slug]/layout.tsx`), for the post `rfpPostId` picks in this
 * environment. Null when there is none or the post fails to load (a pending
 * RFP is not public yet); the page then shows an empty pool that opens soon.
 */
async function loadRfp(preview: string | string[] | undefined) {
  const postId = rfpPostId(preview);
  if (postId == null) return null;
  try {
    const work: Work = await PostService.get(String(postId));
    const grant = work.note?.post?.grant;
    if (!grant?.id) return null;
    return { work, grant };
  } catch {
    return null;
  }
}

/**
 * The landing page for the consciousness request for proposals. The pool,
 * backers, proposals and both buttons are the live RFP's (`data/rfp.ts` says
 * which post); /rfp/<id>/<slug> redirects here on production (see
 * `next.config.js`). All text is server-rendered; the figures
 * are server-drawn stills that come alive once their script loads.
 * It uses the Poster set. For design review, `?design=1&set=ink|clay|spectral|engraved|micrograph`
 * swaps every figure and the palette for another graphic set (compare them
 * all at /consciousness/figures).
 */
export default async function OrchOrPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  // The other graphic sets and hero candidates are for design review, so
  // `?set=` and `?hero=` only apply with `?design=1`, as the pickers do.
  const design = params.design === '1';
  const set = parseSet(design ? params.set : undefined);
  const hero = parseHero(design ? params.hero : undefined);
  const live = await loadRfp(params.rfp);
  const rfp = rfpView(live?.work ?? null);
  const page = (
    <>
      <Hero set={set} hero={hero} rfp={rfp} />
      <Claim />
      <Timeline />
      <Questions set={set} />
      <HowItWorks rfp={rfp} />
      <Proposals rfp={rfp} />
      <Phases rfp={rfp} />
      <AboutResearchHub />
      <TalkToUs />
      <Faq />
      <Sources />
      <ActionDock rfp={rfp} />
      <OrchFooter />
      {/* Design review only: `?design=1` shows the graphic and hero pickers. */}
      {design && <SetSwitcher current={set} hero={hero} />}
    </>
  );
  if (!live) return page;
  return (
    <LiveRfpActions
      grant={live.grant}
      title={live.work.title}
      imageUrl={live.work.image ?? null}
      showTaxLine={isCampaignRfp(params.rfp)}
    >
      {page}
    </LiveRfpActions>
  );
}
