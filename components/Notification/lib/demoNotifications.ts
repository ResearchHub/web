import type { Notification } from '@/types/notification';
import type { User } from '@/types/user';

/**
 * Scripted notifications injected at the top of the notifications page for the
 * presentation demo. These mimic real proposal-related alerts (new submissions,
 * peer reviews, and author updates) and are prepended to the live notification
 * list. Nothing here touches the network.
 */

// Notification types used only by the demo.
export const DEMO_PROPOSAL_SUBMITTED_TYPE = 'GRANT_PROPOSAL_SUBMITTED';
export const DEMO_PROPOSAL_PEER_REVIEWED_TYPE = 'GRANT_PROPOSAL_PEER_REVIEWED';
export const DEMO_PROPOSAL_AUTHOR_UPDATE_TYPE = 'PROPOSAL_AUTHOR_UPDATE';
export const DEMO_PROPOSAL_VIDEO_UPDATE_TYPE = 'PROPOSAL_VIDEO_UPDATE';

interface DemoPerson {
  fullName: string;
  profileImage: string;
}

const makeDemoUser = (id: number, { fullName, profileImage }: DemoPerson): User => {
  const [firstName, ...rest] = fullName.split(' ');
  const lastName = rest.join(' ');
  return {
    id,
    email: '',
    firstName,
    lastName,
    fullName,
    isVerified: true,
    balance: 0,
    lockedBalance: 0,
    moderator: false,
    // Intentionally omit `id` from the author profile so the avatar renders as a
    // plain image instead of a hover-fetching author link during the demo.
    authorProfile: {
      firstName,
      lastName,
      profileImage,
    } as User['authorProfile'],
  };
};

const PEOPLE = {
  attila: {
    fullName: 'Attila Karsi, PhD',
    profileImage: 'https://www.researchhub.com/people/attila.jpeg',
  },
  ruslan: { fullName: 'Ruslan', profileImage: '/people/ruslan.jpeg' },
  emilio: { fullName: 'Emilio Vega', profileImage: '/people/emilio.jpeg' },
  guy: { fullName: 'Guy Laurent', profileImage: '/people/guy.jpeg' },
  qingyu: { fullName: 'Qingyu Zhao', profileImage: '/people/qingyu.jpeg' },
  dominikus: { fullName: 'Dominikus Brian', profileImage: '/people/dominikus_brian.jpeg' },
} satisfies Record<string, DemoPerson>;

interface DemoProposal {
  id: number;
  slug: string;
  title: string;
}

const PROPOSALS = {
  // The primary demo proposal (matches the funded/reviewed proposal elsewhere).
  msRemyelination: {
    id: 30,
    slug: 'a-conserved-fibrotic-extracellular-matrix-brake-on-remyelination-cross-lesion-single-nucleus-mapping-of-oligodendrocyte-differentiation-arrest-in-multiple-sclerosis',
    title:
      'A conserved fibrotic extracellular-matrix brake on remyelination: cross-lesion single-nucleus mapping of oligodendrocyte differentiation arrest in multiple sclerosis',
  },
  ecmCheckpoint: {
    id: 900101,
    slug: 'extracellular-matrix-repair-checkpoint-ms-lesions',
    title:
      'The Extracellular Matrix as a Repair Checkpoint: Single-Nucleus Evidence for a Conserved Fibrotic Barrier in MS Lesions',
  },
  collagenCspg: {
    id: 900102,
    slug: 'stalled-at-the-matrix-collagen-cspg-signature-opcs',
    title:
      'Stalled at the Matrix: Defining the Collagen–CSPG Signature That Holds OPCs Short of Remyelination',
  },
  stromalSignals: {
    id: 900103,
    slug: 'whos-talking-to-the-opcs-stromal-ecm-signals-ms',
    title:
      "Who's Talking to the OPCs? Stromal-Derived ECM Signals and the Transcriptional Arrest of Remyelination in MS",
  },
  matrixOverMaturation: {
    id: 900104,
    slug: 'matrix-over-maturation-fibrotic-brake-opc-differentiation-ms',
    title:
      'Matrix Over Maturation: Cross-Cohort Mapping of the Fibrotic Brake on OPC Differentiation in MS',
  },
} satisfies Record<string, DemoProposal>;

interface DemoNotificationSpec {
  type: string;
  proposal: DemoProposal;
  person: DemoPerson;
  /** Minutes ago the event happened (controls the timestamp / ordering). */
  minutesAgo: number;
  /** Average peer-review score, shown for peer-review notifications. */
  reviewScore?: number;
  /** Playable video URL; when set, clicking opens a video modal. */
  videoUrl?: string;
  /**
   * Sub-path appended after `/proposal/{id}/{slug}` when navigating (e.g. `/reviews`).
   * Defaults to the proposal's main page.
   */
  navigationSubPath?: string;
}

const DEMO_NOTIFICATIONS: DemoNotificationSpec[] = [
  // Featured demo items (top of the list).
  {
    type: DEMO_PROPOSAL_VIDEO_UPDATE_TYPE,
    proposal: PROPOSALS.msRemyelination,
    person: PEOPLE.ruslan,
    minutesAgo: 6,
    videoUrl: '/rus.MP4',
  },
  {
    type: DEMO_PROPOSAL_PEER_REVIEWED_TYPE,
    proposal: PROPOSALS.msRemyelination,
    person: PEOPLE.attila,
    minutesAgo: 3,
    reviewScore: 5.0,
    navigationSubPath: '/reviews',
  },
  // New proposal submissions.
  // {
  //   type: DEMO_PROPOSAL_SUBMITTED_TYPE,
  //   proposal: PROPOSALS.ecmCheckpoint,
  //   person: PEOPLE.attila,
  //   minutesAgo: 8,
  // },
  {
    type: DEMO_PROPOSAL_SUBMITTED_TYPE,
    proposal: PROPOSALS.collagenCspg,
    person: PEOPLE.emilio,
    minutesAgo: 47,
  },
  {
    type: DEMO_PROPOSAL_SUBMITTED_TYPE,
    proposal: PROPOSALS.stromalSignals,
    person: PEOPLE.guy,
    minutesAgo: 132,
  },
  {
    type: DEMO_PROPOSAL_SUBMITTED_TYPE,
    proposal: PROPOSALS.matrixOverMaturation,
    person: PEOPLE.qingyu,
    minutesAgo: 315,
  },
  // Peer reviews on candidate proposals.
  {
    type: DEMO_PROPOSAL_PEER_REVIEWED_TYPE,
    proposal: PROPOSALS.collagenCspg,
    person: PEOPLE.dominikus,
    minutesAgo: 385,
    reviewScore: 5.0,
  },
  {
    type: DEMO_PROPOSAL_PEER_REVIEWED_TYPE,
    proposal: PROPOSALS.ecmCheckpoint,
    person: PEOPLE.qingyu,
    minutesAgo: 430,
    reviewScore: 4.0,
  },
  // Author updates on candidate proposals.
  {
    type: DEMO_PROPOSAL_AUTHOR_UPDATE_TYPE,
    proposal: PROPOSALS.stromalSignals,
    person: PEOPLE.guy,
    minutesAgo: 610,
  },
  {
    type: DEMO_PROPOSAL_AUTHOR_UPDATE_TYPE,
    proposal: PROPOSALS.matrixOverMaturation,
    person: PEOPLE.emilio,
    minutesAgo: 725,
  },
];

export function getDemoProposalNotifications(): Notification[] {
  const now = Date.now();

  return DEMO_NOTIFICATIONS.map((spec, index) => {
    const actionUser = makeDemoUser(800000 + index, spec.person);
    return {
      id: 990000 + index,
      actionUser,
      recipient: actionUser,
      work: {
        id: spec.proposal.id,
        title: spec.proposal.title,
        slug: spec.proposal.slug,
        contentType: 'preregistration',
      },
      type: spec.type,
      body: [],
      extra:
        spec.reviewScore !== undefined || spec.videoUrl !== undefined
          ? { reviewScore: spec.reviewScore, videoUrl: spec.videoUrl }
          : undefined,
      navigationUrl: `/proposal/${spec.proposal.id}/${spec.proposal.slug}${spec.navigationSubPath ?? ''}`,
      read: spec.person.fullName === PEOPLE.attila.fullName,
      readDate: null,
      createdDate: new Date(now - spec.minutesAgo * 60 * 1000),
    } satisfies Notification;
  });
}
