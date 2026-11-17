import { ActionDock } from './components/ActionDock';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Faq, OrchFooter, Proposals, Sources } from './components/Process';
import { Questions } from './components/Questions';
import { SetSwitcher } from './components/SetSwitcher';
import { Claim, Timeline } from './components/Story';
import { parseSet } from './theme';
import { parseHero } from './sets/heroes';
import { ORCH_OR_RFP } from './data/mockRfp';
import { PostService } from '@/services/post.service';
import { MetadataService, type WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';

/**
 * The RFP's post and metadata, the same two requests the RFP page's layout
 * makes (`app/rfp/[id]/[slug]/layout.tsx`). `?rfp=<post id>` previews another
 * RFP while the Orch OR one does not exist yet. Null when there is none or it
 * fails to load; the page then shows its mock state.
 */
async function loadRfp(param: string | string[] | undefined) {
  const preview = typeof param === 'string' && /^\d+$/.test(param) ? Number(param) : null;
  const postId = preview ?? ORCH_OR_RFP.postId;
  if (postId == null) return null;
  try {
    const work: Work = await PostService.get(String(postId));
    const grant = work.note?.post?.grant;
    if (!grant?.id) return null;
    const metadata: WorkMetadata = await MetadataService.get(
      work.unifiedDocumentId?.toString() || ''
    );
    return {
      work,
      metadata,
      grantId: Number(grant.id),
      rfpHref: `/rfp/${work.id}/${work.slug}`,
    };
  } catch {
    return null;
  }
}

/**
 * Preview of the Orch OR request-for-proposals landing page, built on mock
 * RFP data (`data/mockRfp.ts`). All text is server-rendered; the figures
 * are server-drawn stills that come alive once their script loads.
 * It opens in the Poster set; `?set=ink|clay|spectral|engraved|micrograph`
 * swaps every figure and the palette for another graphic set (compare them
 * all at /consciousness/figures).
 */
export default async function OrchOrPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const set = parseSet(params.set);
  const hero = parseHero(params.hero);
  const live = await loadRfp(params.rfp);
  return (
    <>
      <Hero set={set} hero={hero} work={live?.work ?? null} metadata={live?.metadata ?? null} />
      <Claim />
      <Timeline />
      <Questions set={set} />
      <HowItWorks />
      <Proposals live={live && { grantId: live.grantId, rfpHref: live.rfpHref }} />
      <Faq />
      <Sources />
      <ActionDock />
      <OrchFooter />
      <SetSwitcher current={set} hero={hero} />
    </>
  );
}
