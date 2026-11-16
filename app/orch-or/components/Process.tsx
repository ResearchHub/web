import { Plus } from 'lucide-react';
import { FAQ, QUESTIONS, SOURCES } from '../data/content';
import { ORCH_OR_RFP, deadlineLabel, formatUsd, poolTotalUsd } from '../data/mockRfp';
import { FunderMark } from './FunderMark';
import { LiveProposals } from './LiveProposals';
import { PoolPanel } from './PoolPanel';
import { ProposalRow } from './ProposalRow';
import { AddToPoolButton, SubmitProposalButton } from './OrchActions';
import { Rich } from './Rich';
import { PhotoCredits, Wrap } from './Story';

const H2 = 'o-reveal o-serif text-[clamp(32px,4vw,56px)] leading-[1.06]';

/** The launch-day slots: one dashed row per open question. */
function OpenSlots() {
  return (
    <ul aria-label="Open slots" className="mt-10 space-y-3">
      {QUESTIONS.slice(0, 3).map((q, i) => (
        <li
          key={q.id}
          style={{ opacity: 1 - i * 0.3 }}
          className="flex items-center justify-between gap-4 rounded-[10px] border border-dashed border-[color:var(--o-line-2)] px-5 py-4"
        >
          <p className="min-w-0 truncate text-[16px] text-[var(--o-soft)]">
            Your proposal on {q.name.toLowerCase()}
          </p>
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--o-line-2)] text-[var(--o-mute)]"
          >
            <Plus className="h-4 w-4" />
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Proposals and backers. With the RFP live on ResearchHub (`live`), its
 * proposals and activity load in; until then, the mock proposals (each with
 * its question's figure as a cover), or the launch-day slots when there are none.
 */
export function Proposals({ live }: { live?: { grantId: number; rfpHref: string } | null }) {
  const rfp = ORCH_OR_RFP;
  const empty = rfp.proposals.length === 0;
  return (
    <section aria-labelledby="proposals-title" className="o-rule border-t py-24 tablet:py-32">
      <Wrap>
        <div
          data-orch-cta
          className="grid grid-cols-1 gap-14 content-md:grid-cols-12 content-md:gap-16"
        >
          <div className="content-md:col-span-7">
            {live ? (
              <LiveProposals grantId={live.grantId} rfpHref={live.rfpHref} empty={<OpenSlots />} />
            ) : (
              <>
                <h2 id="proposals-title" className={`${H2} max-w-[12em]`}>
                  {empty ? (
                    <>
                      No proposals yet. <em>The first one sets the bar.</em>
                    </>
                  ) : (
                    `${rfp.proposals.length} ${rfp.proposals.length === 1 ? 'proposal' : 'proposals'} so far.`
                  )}
                </h2>
                {empty ? (
                  <OpenSlots />
                ) : (
                  <ul className="o-rule mt-10 divide-y divide-[color:var(--o-line)] border-y">
                    {rfp.proposals.map((p) => {
                      const q = QUESTIONS.find((x) => x.id === p.trackId);
                      return (
                        <ProposalRow
                          key={p.id}
                          p={{
                            href: '#proposals-title',
                            title: p.title,
                            imageUrl: q ? `/orch-or/sets/poster/${q.scene}.webp` : null,
                            authors: p.authors,
                            raisedUsd: p.raisedUsd,
                            goalUsd: p.goalUsd,
                          }}
                        />
                      );
                    })}
                  </ul>
                )}
              </>
            )}
            <div className="mt-8">
              <SubmitProposalButton
                label={live || !empty ? 'Submit a proposal' : 'Be the first to submit'}
              />
            </div>
          </div>

          <PoolPanel />
        </div>
      </Wrap>
    </section>
  );
}

/** The funder and author of the call. Placeholder copy until Athanatos provides its own. */
export function Funder() {
  const { funder } = ORCH_OR_RFP;
  return (
    <section aria-labelledby="funder-title" className="o-rule border-t py-20 tablet:py-28">
      <Wrap>
        <div className="grid grid-cols-1 gap-8 content-md:grid-cols-12 content-md:gap-16">
          <div className="flex items-center gap-5 content-md:col-span-5">
            <FunderMark size={88} logo />
            <div>
              <h2 id="funder-title" className="o-serif text-[clamp(28px,3vw,40px)] leading-tight">
                {funder.name}
              </h2>
              <p className="mt-1 text-[14px] text-[var(--o-mute)]">
                Author and funder of this request for proposals
              </p>
            </div>
          </div>
          <div className="content-md:col-span-7">
            <p className="o-prose">{funder.description}</p>
            <p className="mt-4 text-[14px] text-[var(--o-mute)]">
              {funder.profileUrl ? (
                <a href={funder.profileUrl} className="underline underline-offset-4">
                  Profile on ResearchHub
                </a>
              ) : (
                '[Placeholder] Profile on ResearchHub'
              )}
              <span className="mx-3 opacity-50">·</span>
              {funder.contactEmail ?? '[Placeholder] Contact'}
            </p>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="o-rule border-t py-20 tablet:py-28">
      <Wrap>
        <div className="grid grid-cols-1 gap-8 content-md:grid-cols-12 content-md:gap-16">
          <h2 id="faq-title" className={`${H2} content-md:col-span-4`}>
            FAQs
          </h2>
          <div className="content-md:col-span-8">
            {FAQ.map((f) => (
              <details key={f.q} className="o-rule group border-b first:border-t">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-[18px] leading-snug hover:text-[var(--o-gold)]">
                  {f.q}
                  <Plus
                    aria-hidden
                    className="o-plus h-5 w-5 shrink-0 text-[var(--o-mute)] transition-transform"
                  />
                </summary>
                <p className="pb-6 pr-10 text-[15px] leading-[1.65] text-[var(--o-soft)]">
                  <Rich>{f.a}</Rich>
                </p>
              </details>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function Sources() {
  return (
    <section aria-labelledby="sources-title" className="o-rule border-t py-16 tablet:py-20">
      <Wrap>
        <h2 id="sources-title" className="o-serif text-[24px]">
          Sources
        </h2>
        <ol className="mt-6 grid grid-cols-1 gap-x-12 gap-y-2.5 text-[13px] leading-[1.55] text-[var(--o-mute)] content-md:grid-cols-2">
          {SOURCES.map((s) => (
            <li key={s.id} id={`source-${s.id}`} className="flex scroll-mt-24 gap-3">
              <span className="w-5 shrink-0 tabular-nums opacity-60">{s.id}</span>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--o-text)]"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ol>
        <PhotoCredits />
      </Wrap>
    </section>
  );
}

export function OrchFooter() {
  const rfp = ORCH_OR_RFP;
  return (
    <footer className="o-rule border-t px-5 py-8 text-[12.5px] text-[var(--o-mute)] tablet:px-10">
      A request for proposals by the {rfp.funder.name}, hosted on ResearchHub.
      {rfp.isMock && ' Preview: amounts, dates and funder details are placeholders.'}
    </footer>
  );
}
