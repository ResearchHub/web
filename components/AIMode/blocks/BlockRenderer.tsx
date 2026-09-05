'use client';

import { useEffect, useRef } from 'react';
import { StreamingText } from '../chat/StreamingText';
import type { Citation } from '../lib/citations';
import type { GrantRecord, MessageBlock } from '../lib/types';
import { AllocationsBlock } from './AllocationsBlock';
import { ExpertsBlock } from './ExpertsBlock';
import { JudgmentPromptBlock } from './JudgmentPromptBlock';
import { PaymentBlock } from './PaymentBlock';
import { PeerReviewsBlock } from './PeerReviewsBlock';
import { ProposalsBlock } from './ProposalsBlock';
import { RfpLiveBlock } from './RfpLiveBlock';
import { TimelineBlock } from './TimelineBlock';

/** Beat between a rich block mounting and the next block being released. */
const BLOCK_SETTLE_MS = 320;

/**
 * Rich blocks have nothing to animate, so they hand the reveal frontier onward
 * after a short beat instead. The ref guard keeps the handoff to a single call
 * under StrictMode's double-invoked effects.
 */
const useAdvanceAfterMount = (active: boolean, onDone: () => void) => {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const hasAdvancedRef = useRef(false);

  useEffect(() => {
    if (!active || hasAdvancedRef.current) return;

    const timer = setTimeout(() => {
      hasAdvancedRef.current = true;
      onDoneRef.current();
    }, BLOCK_SETTLE_MS);

    return () => clearTimeout(timer);
  }, [active]);
};

interface BlockRendererProps {
  readonly block: MessageBlock;
  /** True when this block is the one currently being revealed. */
  readonly animate: boolean;
  readonly onDone: () => void;
  /** The program behind the conversation; blocks that need one render nothing without it. */
  readonly grant: GrantRecord | null;
  readonly onCite: (citation: Citation) => void;
}

export const BlockRenderer = ({ block, animate, onDone, grant, onCite }: BlockRendererProps) => {
  useAdvanceAfterMount(animate && block.kind !== 'text', onDone);

  switch (block.kind) {
    case 'text':
      return (
        <StreamingText content={block.content} animate={animate} onDone={onDone} onCite={onCite} />
      );
    case 'proposals':
      return <ProposalsBlock postIds={block.postIds} heading={block.heading} />;
    case 'experts':
      return <ExpertsBlock heading={block.heading} />;
    case 'peer_reviews':
      return <PeerReviewsBlock postIds={block.postIds} heading={block.heading} />;
    case 'payment':
      return (
        <PaymentBlock amountUsd={block.amountUsd} confirmed={grant?.fundedAmountUsd != null} />
      );
    case 'judgment_prompt':
      return <JudgmentPromptBlock grant={grant} />;
    case 'allocations':
      return grant ? <AllocationsBlock policy={grant.judgment.policy} /> : null;
    case 'rfp_live':
      return <RfpLiveBlock title={block.title} />;
    case 'timeline':
      return <TimelineBlock step={block.step} complete={block.complete} />;
    default:
      return null;
  }
};
