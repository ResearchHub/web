import type { InvitedExpert, Reviewer } from './types';

/**
 * Experts the assistant invited to **submit a proposal**, one cluster per
 * unresolved claim. This is the first updates checkpoint: outreach done on the
 * funder's behalf while there is nothing yet to decide.
 *
 * The four who accepted are the four principal investigators whose proposals
 * arrive at the next checkpoint, and the one invited against VASO-C021 is the
 * one who did not — which is why no proposal targets the memory claim and why
 * the assistant reserves budget against it at the end of the run.
 *
 * Representative, not real. Names are invented and the portraits are mock
 * (`public/ai-mode/ATTRIBUTION.md`). Verify the names against a search before
 * presenting: vasocomputation is a small field and a plausible-sounding
 * invented researcher can turn out to exist.
 */
export const INVITED_EXPERTS: InvitedExpert[] = [
  {
    name: 'Ines Halvorsen, PhD',
    affiliation: 'Oslo University Hospital',
    axis: 'VASO-C004 · Release imaging',
    avatarUrl: '/ai-mode/halvorsen.jpg',
    accepted: true,
  },
  {
    name: 'Rafael Otieno-Mbeki, PhD',
    affiliation: 'University of Cape Town',
    axis: 'VASO-C020 · Vascular smooth muscle',
    avatarUrl: '/ai-mode/otieno-mbeki.jpg',
    accepted: true,
  },
  {
    name: 'Junko Aristov, PhD',
    affiliation: 'Karolinska Institutet',
    axis: 'VASO-C004 · Natural history',
    avatarUrl: '/ai-mode/aristov.jpg',
    accepted: true,
  },
  {
    name: 'Kalsang Norbu Rabten, PhD',
    affiliation: 'Central University of Tibetan Studies',
    axis: 'VASO-C022 · Contemplative anatomy',
    avatarUrl: '/ai-mode/rabten.jpg',
    accepted: true,
  },
  {
    name: 'Priya Ramanathan-Boaz, PhD',
    affiliation: 'Weizmann Institute of Science',
    axis: 'VASO-C021 · Neurovascular coupling',
    avatarUrl: '/ai-mode/ramanathan.jpg',
    accepted: false,
  },
  {
    name: 'Olumide Fashakin, MD',
    affiliation: 'University of Ibadan',
    axis: 'VASO-C004 · Rehabilitation trials',
    avatarUrl: '/ai-mode/fashakin.jpg',
    accepted: false,
  },
];

/**
 * Reviewers recruited to score the proposals — a separate roster from the
 * experts invited to write them, since nobody should review against a claim
 * they are competing for.
 *
 * Kirchmayr is here on purpose: she disputes the reliability of the
 * trigger-point construct itself. An RFP on a contested question that only
 * recruits reviewers who accept the premise cannot produce a usable score, and
 * her 3 against the AI reviewer's 5 is the split the assistant surfaces rather
 * than averages.
 */
export const PEER_REVIEWERS: Reviewer[] = [
  {
    name: 'Ilse Vandermeer, PhD',
    affiliation: 'KU Leuven',
    focus: 'Musculoskeletal imaging',
    avatarUrl: '/ai-mode/vandermeer.jpg',
  },
  {
    name: 'Hedda Kirchmayr, PhD',
    affiliation: 'Medical University of Vienna',
    focus: 'Pain medicine · methodological critique',
    avatarUrl: '/ai-mode/kirchmayr.jpg',
  },
  {
    name: 'Tomás Reñé Alcázar, MD, PhD',
    affiliation: 'Universidad de Navarra',
    focus: 'Vascular smooth-muscle physiology',
    avatarUrl: '/ai-mode/alcazar.jpg',
  },
  {
    name: 'Kunga Dorje Tsering, PhD',
    affiliation: 'University of Vienna, Institute for South Asian, Tibetan and Buddhist Studies',
    focus: 'Tibetan medical philology',
    avatarUrl: '/ai-mode/tsering.jpg',
  },
];

const REVIEWERS_BY_NAME = new Map(PEER_REVIEWERS.map((reviewer) => [reviewer.name, reviewer]));

export const getReviewer = (name: string): Reviewer | undefined => REVIEWERS_BY_NAME.get(name);

export const ACCEPTED_EXPERT_COUNT = INVITED_EXPERTS.filter((expert) => expert.accepted).length;
