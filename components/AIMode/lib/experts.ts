import type { InvitedExpert } from './types';

/**
 * Reviewers the assistant recruited for the RFP.
 *
 * These are ResearchHub's own editors and featured scientists, with the same
 * photos, names and affiliations the product already publishes on the journal
 * and globe surfaces. Two reasons for that: the images are local, so they always
 * load in a live demo — the reviewer avatars in the captured feed are Google
 * account URLs that do not — and nobody's identity or affiliation is invented.
 *
 * What is scripted is the axis each was assigned and the review text, which is
 * the assistant's work in the story rather than a claim about these people.
 */
export const INVITED_EXPERTS: InvitedExpert[] = [
  {
    name: 'Suramya Asthana, PhD',
    affiliation: 'Indian Institute of Science',
    axis: 'Replication',
    avatarUrl: '/people/suramya.jpeg',
    accepted: true,
  },
  {
    name: 'Xavier Pereira-Hernández, PhD',
    affiliation: 'Washington State University',
    axis: 'Materials analysis',
    avatarUrl: '/people/xavier.jpeg',
    accepted: true,
  },
  {
    name: 'Scott Nelson, PhD',
    affiliation: 'Iowa State University',
    axis: 'Historical feasibility',
    avatarUrl: '/people/scott.jpeg',
    accepted: true,
  },
  {
    name: 'Dominikus Brian',
    affiliation: 'Shanghai Jiao Tong University',
    axis: 'Materials analysis',
    avatarUrl: '/people/dominikus_brian.jpeg',
    accepted: true,
  },
  {
    name: 'Tibor V. Varga, PhD',
    affiliation: 'University of Copenhagen',
    axis: 'Replication',
    avatarUrl: '/people/tibor.jpeg',
    accepted: false,
  },
  {
    name: 'Ruslan Rust, PhD',
    affiliation: 'University of Southern California',
    axis: 'Historical feasibility',
    avatarUrl: '/people/ruslan.jpeg',
    accepted: false,
  },
];

const EXPERTS_BY_NAME = new Map(INVITED_EXPERTS.map((expert) => [expert.name, expert]));

export const getExpert = (name: string): InvitedExpert | undefined => EXPERTS_BY_NAME.get(name);

export const ACCEPTED_EXPERT_COUNT = INVITED_EXPERTS.filter((expert) => expert.accepted).length;
