import { ActionDock } from './components/ActionDock';
import { Hero } from './components/Hero';
import {
  AboutResearchHub,
  AuditFooter,
  Benefits,
  Faq,
  Problem,
  Proposal,
  Sources,
  TalkToUs,
} from './components/Sections';
import { rfpPostId, rfpView } from './data/rfp';
import { AuditRfpActions } from './components/AuditRfpActions';
import { PostService } from '@/services/post.service';
import type { Work } from '@/types/work';

/**
 * The RFP's post, as the RFP page's layout loads it, for the post `rfpPostId`
 * picks in this environment. Null when there is none or the post fails to
 * load; the page then shows an empty pool that opens soon.
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
 * The landing page for the literature-audit request for proposals: fund AI
 * audits of the open biomedical literature, with experts confirming what
 * the models flag. It shares its hero (pool, backers and both buttons, from
 * the live RFP) with /consciousness and nothing else: the style is a
 * marked-up proof, and the page is three short sections (the problem, the
 * proposal, its benefits). All text is server-rendered;
 * the hero's 3D figure starts once its script loads.
 */
export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const live = await loadRfp(params.rfp);
  const rfp = rfpView(live?.work ?? null);
  const page = (
    <>
      <Hero rfp={rfp} />
      <div className="a-body">
        <Problem />
        <Proposal />
        <Benefits />
        <AboutResearchHub />
        <TalkToUs />
        <Faq />
        <Sources />
      </div>
      <ActionDock rfp={rfp} />
      <AuditFooter />
    </>
  );
  if (!live) return page;
  return (
    <AuditRfpActions grant={live.grant} title={live.work.title} imageUrl={live.work.image ?? null}>
      {page}
    </AuditRfpActions>
  );
}
