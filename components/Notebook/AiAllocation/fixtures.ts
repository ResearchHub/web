import type { AllocationRule } from './rules';

/**
 * Sample data for the allocation tab while the extraction endpoint doesn't
 * exist. Ids are fixed so a list keyed on them stays stable across scans.
 */

/** What a scan of a filled-in RFP would plausibly propose. */
export const SAMPLE_SUGGESTIONS: AllocationRule[] = [
  {
    id: 'sample-suggestion-pi-affiliation',
    type: 'requirement',
    text: 'The lead applicant must be affiliated with an accredited research institution.',
  },
  {
    id: 'sample-suggestion-preregistration',
    type: 'requirement',
    text: 'Proposals must include a preregistered study design and analysis plan.',
  },
  {
    id: 'sample-suggestion-early-career',
    type: 'preference',
    text: 'Favor teams led by an early-career investigator, within 10 years of their PhD.',
  },
  {
    id: 'sample-suggestion-open-data',
    type: 'preference',
    text: 'Prioritize proposals that commit to open data and open-source code.',
  },
  {
    id: 'sample-suggestion-replication',
    type: 'preference',
    text: 'Replication studies of high-impact findings are strongly encouraged.',
  },
  {
    id: 'sample-suggestion-award-cap',
    type: 'limit',
    text: 'No single award may exceed $50,000.',
  },
  {
    id: 'sample-suggestion-award-count',
    type: 'limit',
    text: 'Fund at least three projects from the total budget.',
  },
];

/** Rules a funder has already accepted or written, for a populated state. */
export const SAMPLE_RULES: AllocationRule[] = [
  {
    id: 'sample-rule-no-overhead',
    type: 'limit',
    text: 'Indirect costs are capped at 10% of each award.',
  },
  {
    id: 'sample-rule-geographic-spread',
    type: 'preference',
    text: 'Aim for awards across at least two countries.',
  },
];
