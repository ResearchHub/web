// Mock data for the Funder Dashboard POC
// Models: DMT Quest funder with their consciousness/endogenous DMT grant

export interface FunderProfile {
  id: number;
  name: string;
  description: string;
  avatarInitials: string;
  avatarUrl?: string;
}

export interface GrantSummary {
  id: number;
  postId: number;
  title: string;
  shortTitle: string;
  organization: string;
  slug: string;
  previewImage?: string;
  budgetAmount: { usd: number; rsc: number };
  distributedAmount: { usd: number; rsc: number };
  matchedAmount: { usd: number; rsc: number };
  status: 'OPEN' | 'CLOSED';
  isActive: boolean;
  proposals: ProposalSummary[];
}

export type FundingQuality = 'safe' | 'caution' | 'unsafe';

export interface ProposalSummary {
  id: number;
  preregistrationPostId: number;
  title: string;
  slug: string;
  profile: {
    id: number;
    fullName: string;
    profileImage: string;
    headline?: string;
    institution?: string;
  };
  goalAmount: { usd: number; rsc: number };
  amountRaised: { usd: number; rsc: number };
  reviewMetrics?: { avg: number; count: number };
  fundingQuality: FundingQuality;
  nonprofit?: { name: string };
  aiReview?: AIReview;
  updates: StoryUpdate[];
}

export interface AIReview {
  summary: string;
  recommendation: string;
  strengths: string[];
  concerns: string[];
  humanReviews: HumanReview[];
}

export interface HumanReview {
  reviewerName: string;
  institution: string;
  score: number;
  comment: string;
  date: string;
}

export type StoryType = 'social' | 'media' | 'publication' | 'event';

export type EmbedType = 'tiktok' | 'linkedin' | null;

export interface StoryUpdate {
  id: string;
  headline: string;
  source: string;
  sourceType: 'x' | 'linkedin' | 'media' | 'publication' | 'tiktok' | 'instagram';
  date: string;
  url: string;
  excerpt?: string;
  imageUrl?: string;
  type: StoryType;
  proposalId?: number;
  researcherName: string;
  embedType?: EmbedType;
  embedId?: string; // TikTok video ID or LinkedIn post ID
}

// ─── Funder ───────────────────────────────────────────────────────
export const MOCK_FUNDER: FunderProfile = {
  id: 1,
  name: 'DMT Quest',
  description:
    'Funding cutting-edge research exploring expanded consciousness, endogenous DMT production, and novel approaches to understanding the human mind.',
  avatarInitials: 'DQ',
  avatarUrl: 'https://dmtquest.org/wp-content/uploads/2026/03/nIMG_0502.jpg',
};

// ─── Proposals ────────────────────────────────────────────────────

const proposalRickHarris: ProposalSummary = {
  id: 4082,
  preregistrationPostId: 4082,
  title: 'Energy Healing Brain Hyper Scanning in Fibromyalgia',
  slug: 'energy-healing-brain-hyper-scanning-in-fibromyalgia',
  profile: {
    id: 101,
    fullName: 'Richard Harris',
    profileImage: '',
    headline: 'Professor of Anesthesiology',
    institution: 'UC Irvine',
  },
  goalAmount: { usd: 400000, rsc: 6990000 },
  amountRaised: { usd: 24029, rsc: 419839 },
  reviewMetrics: { avg: 3.0, count: 2 },
  fundingQuality: 'caution',
  nonprofit: { name: 'UC Irvine Foundation' },
  aiReview: {
    summary:
      'This proposal investigates energy healing effects on brain connectivity in fibromyalgia patients using hyperscanning EEG. The methodology is innovative but the large budget requires stronger justification.',
    recommendation: 'Use Caution',
    strengths: [
      'Novel hyperscanning approach to study healer-patient brain synchronization',
      'Clear clinical relevance for fibromyalgia patients',
      'Well-established PI with strong institutional backing at UCI',
    ],
    concerns: [
      'Budget of $400K is high relative to the pilot nature of the study',
      'Energy healing mechanisms lack established theoretical framework',
      'Only 2 peer reviews completed — more expert evaluation recommended',
    ],
    humanReviews: [
      {
        reviewerName: 'Dr. Sarah Chen',
        institution: 'Harvard Medical School',
        score: 4.0,
        comment:
          'Innovative use of hyperscanning to study healer-patient interactions. The EEG methodology is sound, though the sample size could be larger for the budget requested.',
        date: '2025-06-15',
      },
      {
        reviewerName: 'Dr. Michael Torres',
        institution: 'Stanford University',
        score: 2.0,
        comment:
          'While the clinical question is interesting, the theoretical basis for energy healing needs stronger grounding. The budget allocation is not well justified.',
        date: '2025-07-02',
      },
    ],
  },
  updates: [
    {
      id: 'rh-1',
      headline: "Rick Harris' proposal highlighted on ResearchHub",
      source: 'ResearchHub',
      sourceType: 'x',
      date: '2025-08-28',
      url: 'https://x.com/ResearchHub/status/1961107921070358902',
      excerpt:
        'Energy Healing Brain Hyper Scanning in Fibromyalgia — a bold new approach to studying healer-patient brain connectivity.',
      type: 'social',
      researcherName: 'Richard Harris',
    },
  ],
};

const proposalFadelZeidan: ProposalSummary = {
  id: 4094,
  preregistrationPostId: 4094,
  title:
    'Investigating the Neural and Cerebrovascular Effects of the Wim Hof Breathing Technique: Implications for Glymphatic Function and Brain Waste Clearance',
  slug: 'investigating-the-neural-and-cerebrovascular-effects-of-the-wim-hof-breathing-technique',
  profile: {
    id: 102,
    fullName: 'Fadel Zeidan',
    profileImage: '',
    headline: 'Associate Professor of Anesthesiology',
    institution: 'UC San Diego',
  },
  goalAmount: { usd: 276000, rsc: 4822800 },
  amountRaised: { usd: 23107, rsc: 403730 },
  reviewMetrics: { avg: 3.0, count: 1 },
  fundingQuality: 'caution',
  nonprofit: { name: 'UC San Diego Foundation' },
  aiReview: {
    summary:
      'A well-designed fMRI study examining Wim Hof Breathing effects on glymphatic clearance. Strong clinical relevance with growing public interest in breathwork, but needs more peer review.',
    recommendation: 'Use Caution',
    strengths: [
      'Rigorous fMRI methodology from a top neuroimaging lab',
      'High public interest — Wim Hof method has millions of practitioners worldwide',
      'Clear translational potential for neurodegenerative disease prevention',
    ],
    concerns: [
      'Only 1 peer review completed so far',
      'Glymphatic clearance measurement via MRI is still methodologically debated',
      'Budget of $276K needs clearer breakdown',
    ],
    humanReviews: [
      {
        reviewerName: 'Dr. Elena Vasquez',
        institution: 'Albert Einstein College of Medicine',
        score: 3.0,
        comment:
          'Solid experimental design. The connection between breathwork and glymphatic function is compelling but speculative. Would like to see more preliminary data.',
        date: '2025-06-20',
      },
    ],
  },
  updates: [
    {
      id: 'fz-1',
      headline: 'UCSD fMRI Breathwork & Brain Waste Clearance Study featured in YogaJala',
      source: 'YogaJala',
      sourceType: 'media',
      date: '2026-04-04',
      url: 'https://yogajala.com/ucsd-fmri-breathwork-brain-waste-clearance-study-2026/',
      excerpt:
        'A new UCSD study funded through ResearchHub will use fMRI to investigate whether the Wim Hof Breathing Technique can enhance brain waste clearance through the glymphatic system.',
      imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600',
      type: 'media',
      researcherName: 'Fadel Zeidan',
    },
    {
      id: 'fz-2',
      headline:
        "Fadel Zeidan's image featured by PAIN journal — mindfulness meditation reduces anxiety",
      source: 'PAIN (IASP)',
      sourceType: 'linkedin',
      date: '2026-04-03',
      url: 'https://www.linkedin.com/posts/iasp-pain_pain-pain-activity-7445922612226105344-jWu1',
      excerpt:
        "Fadel Zeidan's research demonstrating how mindfulness meditation significantly reduced anxiety compared to controls was featured by PAIN, the official journal of IASP.",
      type: 'publication',
      researcherName: 'Fadel Zeidan',
    },
    {
      id: 'fz-3',
      headline: 'Wim Hof brings breathwork experience to San Diego — Zeidan study highlighted',
      source: 'LocallyWell',
      sourceType: 'media',
      date: '2026-03-10',
      url: 'https://www.locallywell.com/wim-hof-brings-his-signature-breathwork-and-ice-bath-experience-to-san-diego/',
      excerpt:
        "Fadel Zeidan's UCSD study on the Wim Hof Breathing Technique was highlighted alongside a major Wim Hof event in San Diego.",
      type: 'media',
      researcherName: 'Fadel Zeidan',
    },
    {
      id: 'fz-4',
      headline: 'SciCon 2025 highlight video features Fadel Zeidan',
      source: 'ResearchHub Foundation',
      sourceType: 'x',
      date: '2026-01-10',
      url: 'https://x.com/ResearchHubF/status/2010018921701572802',
      type: 'event',
      researcherName: 'Fadel Zeidan',
    },
    {
      id: 'fz-5',
      headline: "Fadel Zeidan's photo from SciCon 2025 featured",
      source: 'ResearchHub Foundation',
      sourceType: 'x',
      date: '2025-12-07',
      url: 'https://x.com/ResearchHubF/status/1997796354651980021',
      type: 'event',
      researcherName: 'Fadel Zeidan',
    },
    {
      id: 'fz-6',
      headline: 'Fadel Zeidan announced as SciCon 2025 panelist',
      source: 'ResearchHub Foundation',
      sourceType: 'linkedin',
      date: '2025-12-01',
      url: 'https://www.linkedin.com/posts/researchhubfoundation_faster-and-more-transparent-science-funding-activity-7400201860588077056-s15d',
      type: 'event',
      researcherName: 'Fadel Zeidan',
      embedType: 'linkedin',
      embedId: '7400201860588077056',
    },
    {
      id: 'fz-7',
      headline: "Zeidan's proposal highlighted on ResearchHub",
      source: 'ResearchHub',
      sourceType: 'x',
      date: '2025-08-14',
      url: 'https://x.com/ResearchHub/status/1956028698387472612',
      type: 'social',
      researcherName: 'Fadel Zeidan',
    },
  ],
};

const proposalJohnGray: ProposalSummary = {
  id: 4221,
  preregistrationPostId: 4221,
  title: 'Effects of Neuromodulatory Stimulation on Endogenous Psychedelics',
  slug: 'effects-of-neuromodulatory-stimulation-on-endogenous-psychedelics',
  profile: {
    id: 103,
    fullName: 'John Gray',
    profileImage: '',
    headline: 'Professor of Psychiatry (h-index: 81)',
    institution: 'UC Davis',
  },
  goalAmount: { usd: 149000, rsc: 2603520 },
  amountRaised: { usd: 18522, rsc: 323615 },
  reviewMetrics: { avg: 4.5, count: 6 },
  fundingQuality: 'safe',
  nonprofit: { name: 'UC Davis Foundation' },
  aiReview: {
    summary:
      'Highly rated proposal from a world-class researcher (h-index 81) studying how neuromodulatory stimulation affects endogenous psychedelic production. Strong peer support with 6 reviews averaging 4.5/5.',
    recommendation: 'Safe to Fund',
    strengths: [
      'Exceptional PI credentials — h-index of 81, UC Davis Department of Psychiatry',
      'Strongest peer review consensus: 6 reviews averaging 4.5/5',
      'Direct alignment with DMT Quest mission on endogenous psychedelics',
      'Reasonable budget of $149K relative to scope',
    ],
    concerns: [
      'Collaboration with David Olson adds complexity to project management',
      'Endogenous psychedelic measurement techniques are still maturing',
    ],
    humanReviews: [
      {
        reviewerName: 'Dr. Robin Carhart-Harris',
        institution: 'UCSF',
        score: 5.0,
        comment:
          'Exceptional proposal. Gray is one of the foremost experts in psychiatric neuroscience. The approach to studying endogenous psychedelic modulation is innovative and scientifically rigorous.',
        date: '2025-08-15',
      },
      {
        reviewerName: 'Dr. Amanda Fielding',
        institution: 'Beckley Foundation',
        score: 4.5,
        comment:
          'This is exactly the kind of research that could unlock our understanding of endogenous DMT. Well-designed with appropriate controls.',
        date: '2025-09-01',
      },
      {
        reviewerName: 'Dr. James Peterson',
        institution: 'Johns Hopkins University',
        score: 4.0,
        comment:
          'Solid methodology. The neuromodulatory approach is clever and could yield significant insights into consciousness mechanisms.',
        date: '2025-08-28',
      },
    ],
  },
  updates: [
    {
      id: 'jg-1',
      headline:
        "Gray & Olson's proposal highlighted on ResearchHub — exploring endogenous psychedelics",
      source: 'ResearchHub',
      sourceType: 'x',
      date: '2025-07-31',
      url: 'https://x.com/ResearchHub/status/1950945814991544419',
      excerpt:
        'John Gray (h-index: 81) and David Olson team up to study how neuromodulatory stimulation affects endogenous psychedelic production in the brain.',
      type: 'social',
      researcherName: 'John Gray & David Olson',
    },
  ],
};

const proposalGuyFincham: ProposalSummary = {
  id: 4086,
  preregistrationPostId: 4086,
  title: 'DeSci Fellowship x BreathworkLab',
  slug: 'desci-fellowship-x-breathworklab',
  profile: {
    id: 104,
    fullName: 'Guy W. Fincham',
    profileImage: '',
    headline: 'PhD, Breathwork Researcher',
    institution: 'Brighton & Sussex Medical School',
  },
  goalAmount: { usd: 100000, rsc: 1748000 },
  amountRaised: { usd: 9913, rsc: 173200 },
  reviewMetrics: { avg: 3.33, count: 3 },
  fundingQuality: 'caution',
  nonprofit: { name: 'University of Sussex Foundation' },
  aiReview: {
    summary:
      "Guy Fincham's DeSci Fellowship is a highly visible project with exceptional media traction (Financial Times, Washington Post, Salon). The research is accessible and has generated significant public interest.",
    recommendation: 'Use Caution',
    strengths: [
      'Extraordinary media coverage — Financial Times, Washington Post, Salon, Psyche Magazine',
      'Strong public engagement and social proof',
      'Active publication record with multiple papers in 2025-2026',
      'Year 2 proposal already live, demonstrating continuation and momentum',
    ],
    concerns: [
      'Review average of 3.33 suggests mixed expert opinions',
      'Breathwork research is nascent — replication potential uncertain',
      'Budget allocation across fellowship activities could be clearer',
    ],
    humanReviews: [
      {
        reviewerName: 'Dr. Patricia Gerbarg',
        institution: 'New York Medical College',
        score: 4.0,
        comment:
          'Fincham has emerged as a key figure in breathwork science. The fellowship model is innovative and the publication output is impressive.',
        date: '2025-07-10',
      },
      {
        reviewerName: 'Dr. Nigel Blackwood',
        institution: "King's College London",
        score: 3.0,
        comment:
          'Good output but the theoretical framework needs strengthening. The neuromuscular nexus concept requires more rigorous testing.',
        date: '2025-08-05',
      },
      {
        reviewerName: 'Dr. Roderik Gerritsen',
        institution: 'Leiden University',
        score: 3.0,
        comment:
          'Interesting work but would benefit from more controlled experimental designs. The current evidence is suggestive rather than conclusive.',
        date: '2025-08-20',
      },
    ],
  },
  updates: [
    {
      id: 'gf-1',
      headline: 'Guy Fincham posts about Year 2 funding request on X',
      source: 'Guy Fincham',
      sourceType: 'x',
      date: '2026-03-30',
      url: 'https://x.com/breath_Guy/status/2038551892318364090',
      excerpt:
        "Excited to share that our Year 2 DeSci Fellowship proposal is now live on ResearchHub. We're looking to continue our breathwork research.",
      type: 'social',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-2',
      headline: 'Year 2 DeSci Fellowship proposal is live on ResearchHub',
      source: 'ResearchHub',
      sourceType: 'publication',
      date: '2026-03-27',
      url: 'https://www.researchhub.com/proposal/32061/desci-fellowship-x-breathworklab-year-2',
      excerpt:
        "Guy Fincham's Year 2 proposal for the DeSci Fellowship x BreathworkLab is now live and currently raising funds.",
      type: 'publication',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-3',
      headline: 'Newest member joins the Breathwork Lab',
      source: 'Guy Fincham',
      sourceType: 'x',
      date: '2026-03-13',
      url: 'https://x.com/breath_Guy/status/2032456978492989527',
      type: 'social',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-4',
      headline: 'Guy Fincham announces new publication on X',
      source: 'Guy Fincham',
      sourceType: 'x',
      date: '2026-03-10',
      url: 'https://x.com/breath_Guy/status/2031406922084081921',
      type: 'social',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-5',
      headline: 'Breathwork essay highlighted by Global Wellness Institute',
      source: 'Global Wellness Institute',
      sourceType: 'media',
      date: '2026-02-26',
      url: 'https://globalwellnessinstitute.org/global-wellness-institute-blog/2026/02/26/breathwork-offers-a-universally-accessible-tool-for-transformation-guy-w-fincham-founder-of-brighton-sussex-breathwork-lab/',
      excerpt:
        'Breathwork offers a universally accessible tool for transformation — Guy W. Fincham, Founder of Brighton & Sussex Breathwork Lab.',
      type: 'media',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-6',
      headline: "Guy Fincham's research featured in the Financial Times",
      source: 'Financial Times',
      sourceType: 'media',
      date: '2026-01-26',
      url: 'https://www.ft.com/content/9ea74388-d888-4255-bece-a844ae690801',
      excerpt:
        "The Financial Times covers Guy Fincham's groundbreaking breathwork research funded through ResearchHub's DeSci Fellowship program.",
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600',
      type: 'media',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-7',
      headline: 'Guy Fincham announces publication on X',
      source: 'Guy Fincham',
      sourceType: 'x',
      date: '2026-01-23',
      url: 'https://x.com/breath_Guy/status/2014651908510662828',
      type: 'social',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-8',
      headline: 'SciCon 2025 highlight video features Fincham',
      source: 'ResearchHub Foundation',
      sourceType: 'x',
      date: '2026-01-10',
      url: 'https://x.com/ResearchHubF/status/2010018921701572802',
      type: 'event',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-pub-2',
      headline: 'Published: Neuromuscular Nexus — torque chains as a paradigm-shifting framework',
      source: 'ResearchHub Journal',
      sourceType: 'publication',
      date: '2025-07-19',
      url: 'https://www.researchhub.com/paper/9446208/the-neuromuscular-nexus',
      type: 'publication',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-wash',
      headline: "Fincham's breathwork research featured in the Washington Post",
      source: 'Washington Post',
      sourceType: 'media',
      date: '2025-01-01',
      url: 'https://www.washingtonpost.com/wellness/2025/01/01/breathwork-slow-breathing-calm-mind/',
      excerpt:
        "The Washington Post covers how slow breathing can calm the mind, citing Guy Fincham's research.",
      imageUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=600',
      type: 'media',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-salon',
      headline: 'Fincham cited by Salon.com in major breathwork feature',
      source: 'Salon',
      sourceType: 'media',
      date: '2025-04-23',
      url: 'https://www.salon.com/2025/04/23/breathe-in-breathe-out-people-are-tripping-out-on-breathwork-but-its-not-for-everyone/',
      excerpt:
        "People are tripping out on breathwork — but it's not for everyone. Guy Fincham's research cited as key evidence.",
      type: 'media',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-psyche',
      headline: 'Fincham writes essay for Psyche Magazine: "I was sceptical about breathwork"',
      source: 'Psyche (Aeon)',
      sourceType: 'media',
      date: '2025-05-15',
      url: 'https://psyche.co/ideas/i-was-sceptical-about-breathwork-so-i-did-my-own-research',
      excerpt:
        'I was sceptical about breathwork, so I did my own research — an essay by Guy Fincham for Psyche Magazine.',
      type: 'media',
      researcherName: 'Guy Fincham',
    },
    {
      id: 'gf-coauth',
      headline: 'Published in Biological Psychology: Hypnotizability and interoception',
      source: 'Biological Psychology',
      sourceType: 'publication',
      date: '2026-03-30',
      url: 'https://www.sciencedirect.com/science/article/pii/S0301051126000499',
      excerpt:
        'Coauthored paper on hypnotizability and interoception — differential associations with accuracy, sensibility, and awareness.',
      type: 'publication',
      researcherName: 'Guy Fincham',
    },
  ],
};

const proposalNickDenomme: ProposalSummary = {
  id: 4128,
  preregistrationPostId: 4128,
  title:
    'Neuromodulation of Color Change in Panther Chameleons: A New Animal Model of Behavior and Psychoactive Drug Action',
  slug: 'neuromodulation-of-color-change-in-panther-chameleons',
  profile: {
    id: 105,
    fullName: 'Nicholas Denomme',
    profileImage: '',
    headline: 'Postdoctoral Fellow',
    institution: 'Stanford University',
  },
  goalAmount: { usd: 40000, rsc: 699200 },
  amountRaised: { usd: 4705, rsc: 82203 },
  reviewMetrics: { avg: 4.0, count: 1 },
  fundingQuality: 'safe',
  nonprofit: undefined,
  aiReview: {
    summary:
      'A creative and visually striking proposal using panther chameleon color change as a real-time readout for psychoactive drug effects. High viral potential and strong science communication value.',
    recommendation: 'Safe to Fund',
    strengths: [
      'Highly innovative — using chameleon color change as a bioassay is novel',
      'Strong virality: TikTok video already generating significant engagement',
      'Stanford postdoc with relevant expertise in neuromodulation',
      'Modest budget of $40K — low risk, high potential reward',
    ],
    concerns: [
      'Only 1 peer review — more evaluation recommended',
      'Translational value to human consciousness research is indirect',
    ],
    humanReviews: [
      {
        reviewerName: 'Dr. Kurt Bhatt',
        institution: 'MIT',
        score: 4.0,
        comment:
          'Brilliantly creative use of a natural biological system. The chameleon model could provide real-time visualization of neural states in ways not possible with traditional models.',
        date: '2025-09-10',
      },
    ],
  },
  updates: [
    {
      id: 'nd-1',
      headline: "Nick Denomme's chameleon research goes viral on TikTok",
      source: 'TikTok',
      sourceType: 'tiktok',
      date: '2026-01-22',
      url: 'https://www.tiktok.com/@research_hub/video/7598327028147817759',
      excerpt:
        "Can psychoactive drugs change a chameleon's colors? Nick Denomme's research at Stanford is finding out — and it's mesmerizing.",
      imageUrl: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd659e3?w=600',
      type: 'social',
      researcherName: 'Nicholas Denomme',
      embedType: 'tiktok',
      embedId: '7598327028147817759',
    },
    {
      id: 'nd-2',
      headline: "Denomme's chameleon research featured on Instagram",
      source: 'Instagram',
      sourceType: 'instagram',
      date: '2026-01-22',
      url: 'https://www.instagram.com/reel/DT1QMuDCQ3U/',
      type: 'social',
      researcherName: 'Nicholas Denomme',
    },
    {
      id: 'nd-3',
      headline: 'SciCon 2025 highlight video features Nick Denomme',
      source: 'ResearchHub Foundation',
      sourceType: 'x',
      date: '2026-01-10',
      url: 'https://x.com/ResearchHubF/status/2010018921701572802',
      type: 'event',
      researcherName: 'Nicholas Denomme',
    },
    {
      id: 'nd-4',
      headline: 'Nick Denomme announced as SciCon 2025 panelist',
      source: 'ResearchHub Foundation',
      sourceType: 'x',
      date: '2025-11-28',
      url: 'https://x.com/ResearchHubF/status/1994436170022010969',
      type: 'event',
      researcherName: 'Nicholas Denomme',
    },
    {
      id: 'nd-5',
      headline: "Denomme's chameleon work featured in video on X",
      source: 'ResearchHub',
      sourceType: 'x',
      date: '2025-08-22',
      url: 'https://x.com/ResearchHub/status/1958922355541254495',
      type: 'social',
      researcherName: 'Nicholas Denomme',
    },
    {
      id: 'nd-6',
      headline: "Denomme's proposal highlighted on ResearchHub",
      source: 'ResearchHub',
      sourceType: 'x',
      date: '2025-08-22',
      url: 'https://x.com/ResearchHub/status/1958912460465029195',
      type: 'social',
      researcherName: 'Nicholas Denomme',
    },
  ],
};

const proposalRuslanRust: ProposalSummary = {
  id: 4200,
  preregistrationPostId: 4200,
  title: 'Effects of Psilocybin and Related Compounds on Neuroprotection in Human Stroke',
  slug: 'effects-of-psilocybin-and-related-compounds-on-neuroprotection-in-human-stroke',
  profile: {
    id: 106,
    fullName: 'Ruslan Rust',
    profileImage: '',
    headline: 'Assistant Professor, Neurosurgery',
    institution: 'USC Keck School of Medicine',
  },
  goalAmount: { usd: 200000, rsc: 3496000 },
  amountRaised: { usd: 15200, rsc: 265700 },
  reviewMetrics: { avg: 4.2, count: 4 },
  fundingQuality: 'safe',
  nonprofit: { name: 'USC Foundation' },
  aiReview: {
    summary:
      "A compelling translational study examining psilocybin's neuroprotective effects in stroke. Strong institutional backing at USC Keck, co-funded by Bio Protocol, and already published as a Stage 1 Registered Report.",
    recommendation: 'Safe to Fund',
    strengths: [
      'Published Stage 1 Registered Report — methodology pre-approved by peer review',
      'Co-funded by Bio Protocol (DeSci biotech treasury) — validated by multiple funding bodies',
      'USC Keck faculty with active publication record',
      'Clear clinical relevance for stroke neuroprotection',
    ],
    concerns: [
      'Psilocybin research in stroke patients involves complex regulatory hurdles',
      'Sample recruitment for stroke patients may be challenging',
    ],
    humanReviews: [
      {
        reviewerName: 'Dr. David Bhatt',
        institution: 'Mount Sinai Hospital',
        score: 4.5,
        comment:
          'Excellent proposal with strong translational potential. The registered report format adds confidence in the methodology.',
        date: '2025-10-05',
      },
      {
        reviewerName: 'Dr. Gül Bhatt',
        institution: 'ETH Zurich',
        score: 4.0,
        comment:
          'Innovative approach to stroke neuroprotection. The psilocybin angle is well-justified by emerging preclinical evidence.',
        date: '2025-10-15',
      },
      {
        reviewerName: 'Dr. Lisa Chen',
        institution: 'UCLA',
        score: 4.5,
        comment:
          'Rust has the right background and institutional support for this work. The Bio Protocol co-funding is a strong signal.',
        date: '2025-11-01',
      },
      {
        reviewerName: 'Dr. Ahmed Hassan',
        institution: 'Mayo Clinic',
        score: 3.8,
        comment:
          'Good science but regulatory and recruitment challenges should not be underestimated.',
        date: '2025-11-10',
      },
    ],
  },
  updates: [
    {
      id: 'rr-1',
      headline: "Ruslan Rust's faculty profile at USC Keck lists psilocybin/stroke project",
      source: 'USC Keck School of Medicine',
      sourceType: 'media',
      date: '2026-04-01',
      url: 'https://keck.usc.edu/faculty-search/ruslan-rust/',
      excerpt:
        "Ruslan Rust's faculty profile at Keck School of Medicine now lists the psilocybin/stroke project alongside a very active publication record.",
      type: 'publication',
      researcherName: 'Ruslan Rust',
    },
    {
      id: 'rr-2',
      headline: 'Ruslan Rust featured in TikTok video by ResearchHub',
      source: 'TikTok',
      sourceType: 'tiktok',
      date: '2026-01-22',
      url: 'https://www.tiktok.com/@research_hub/video/7606498325310852382',
      excerpt:
        'Can psilocybin protect the brain after a stroke? Ruslan Rust at USC is finding out.',
      type: 'social',
      researcherName: 'Ruslan Rust',
    },
    {
      id: 'rr-3',
      headline: 'Stage 1 Registered Report published on ResearchHub',
      source: 'ResearchHub',
      sourceType: 'publication',
      date: '2025-11-16',
      url: 'https://www.researchhub.com/paper/9976579/effects-of-psilocybin-and-related-compounds-on-cerebroprotection-during-ischemic-stroke-stage-1-registered-report',
      excerpt:
        'Ruslan Rust publishes the Stage 1 Registered Report for his psilocybin and stroke neuroprotection study on ResearchHub.',
      type: 'publication',
      researcherName: 'Ruslan Rust',
    },
    {
      id: 'rr-4',
      headline: 'Bio Protocol co-funds psilocybin stroke study via $RSC treasury',
      source: 'Bio Protocol',
      sourceType: 'x',
      date: '2025-09-01',
      url: 'https://x.com/BioProtocol/status/1962606296969990524',
      excerpt:
        "Bio Protocol announces co-funding of Ruslan Rust's psilocybin stroke study through the Bio treasury using $RSC.",
      type: 'social',
      researcherName: 'Ruslan Rust',
    },
    {
      id: 'rr-5',
      headline: "Drug Target Review covers Rust's neural xenograft stem cell work",
      source: 'Drug Target Review',
      sourceType: 'media',
      date: '2025-09-17',
      url: 'https://www.drugtargetreview.com/news/187869/new-stem-cell-approach-could-repair-stroke-damaged-brains/',
      excerpt:
        "New stem cell approach could repair stroke-damaged brains — Ruslan Rust's broader research program covered by Drug Target Review.",
      type: 'media',
      researcherName: 'Ruslan Rust',
    },
    {
      id: 'rr-6',
      headline: 'Ruslan Rust announces pre-registration on X',
      source: 'Ruslan Rust',
      sourceType: 'x',
      date: '2025-07-28',
      url: 'https://x.com/rust_ruslan/status/1949876481745977381',
      type: 'social',
      researcherName: 'Ruslan Rust',
    },
    {
      id: 'rr-7',
      headline: 'Patrick Joyce (ResearchHub co-founder) amplifies proposal on X',
      source: 'Patrick Joyce',
      sourceType: 'x',
      date: '2025-07-28',
      url: 'https://x.com/joycesticks/status/1949898470262989229',
      type: 'social',
      researcherName: 'Ruslan Rust',
    },
  ],
};

// ─── Grant ────────────────────────────────────────────────────────

export const MOCK_GRANT: GrantSummary = {
  id: 2,
  postId: 4175,
  title: 'Request for Proposals: Exploring Expanded Consciousness and Endogenous DMT',
  shortTitle: 'Expanded Consciousness & Endogenous DMT',
  organization: 'DMT Quest',
  slug: 'request-for-proposals-exploring-expanded-consciousness-and-endogenous-dmt',
  previewImage:
    'https://storage.prod.researchhub.com/uploads/posts/users/39602/d2d223cc-2869-4993-a661-31245a65d763/screenshot-2026-04-07-at-1.png',
  budgetAmount: { usd: 500000, rsc: 8740000 },
  distributedAmount: { usd: 95476, rsc: 1668287 },
  matchedAmount: { usd: 12340, rsc: 215700 },
  status: 'OPEN',
  isActive: true,
  proposals: [
    proposalJohnGray,
    proposalRuslanRust,
    proposalNickDenomme,
    proposalFadelZeidan,
    proposalGuyFincham,
    proposalRickHarris,
  ],
};

// ─── Second Grant: In Silico Drug Screening ──────────────────────

const proposalJuanOsuna: ProposalSummary = {
  id: 32111,
  preregistrationPostId: 32111,
  title:
    'Machine Learning\u2013Guided and Site-Resolved In Silico Screening for Identification of RSV F-Protein Modulators',
  slug: 'machine-learningguided-and-site-resolved',
  profile: {
    id: 201,
    fullName: 'Juan Fidel Osuna-Ramos',
    profileImage:
      'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/04/02/blob_nbbFNIE',
    headline: 'Researcher',
    institution: 'Instituto Polit\u00e9cnico Nacional',
  },
  goalAmount: { usd: 5000, rsc: 87361 },
  amountRaised: { usd: 10, rsc: 177 },
  reviewMetrics: { avg: 0, count: 0 },
  fundingQuality: 'caution',
  nonprofit: undefined,
  aiReview: {
    summary:
      'A proposal targeting RSV F-protein using both ML-based and classical docking methods. The target is clinically relevant but the proposal has not yet received any peer reviews.',
    recommendation: 'Use Caution',
    strengths: [
      'Clinically relevant target — RSV remains a major pediatric pathogen',
      'Clear comparison of ML vs classical methods as required by the grant',
      'Institutional backing from Instituto Polit\u00e9cnico Nacional',
    ],
    concerns: [
      'No peer reviews yet — expert evaluation needed',
      'Limited preliminary data shown for the specific RSV target',
      'Budget justification could be more detailed',
    ],
    humanReviews: [],
  },
  updates: [
    {
      id: 'jo-1',
      headline: 'RSV F-Protein drug screening proposal submitted to ResearchHub',
      source: 'ResearchHub',
      sourceType: 'publication',
      date: '2026-04-02',
      url: 'https://www.researchhub.com/proposal/32111/machine-learningguided-and-site-resolved',
      excerpt:
        'Juan Fidel Osuna-Ramos submits ML-guided in silico screening proposal targeting RSV F-Protein modulators.',
      type: 'publication',
      researcherName: 'Juan Fidel Osuna-Ramos',
    },
    {
      id: 'jo-2',
      headline: 'ResearchHub Foundation launches In Silico Drug Screening microgrant',
      source: 'ResearchHub',
      sourceType: 'x',
      date: '2026-03-28',
      url: 'https://www.linkedin.com/posts/researchhubfoundation_faster-and-more-transparent-science-funding-activity-7400201860588077056-s15d',
      excerpt:
        'New $5K microgrant for computational drug discovery — comparing ML-based and classical screening methods.',
      type: 'social',
      researcherName: 'ResearchHub Foundation',
      embedType: 'linkedin',
      embedId: '7400201860588077056',
    },
  ],
};

const proposalHarshitSoni: ProposalSummary = {
  id: 32102,
  preregistrationPostId: 32102,
  title:
    'A Reproducible Comparison of Machine Learning and Classical Docking Approaches for In Silico Drug Screening on KRAS',
  slug: 'a-reproducible-comparison-of-machine-learning-and-classical-docking-approaches-for-in-silico-drug-screening-on-kras',
  profile: {
    id: 202,
    fullName: 'Harshit Kumar Soni',
    profileImage:
      'https://lh3.googleusercontent.com/a/ACg8ocJBpf_Okr7nT5dPFrHOCiG1okLEKPFd6gzhb8RATz1ScfkZqRDc=s96-c',
    headline: 'Researcher',
    institution: 'University of Pune',
  },
  goalAmount: { usd: 5000, rsc: 87361 },
  amountRaised: { usd: 0, rsc: 0 },
  reviewMetrics: { avg: 4.4, count: 5 },
  fundingQuality: 'safe',
  nonprofit: undefined,
  aiReview: {
    summary:
      'A well-reviewed proposal comparing ML-based and classical docking for KRAS — one of the most important oncology targets. Strong peer consensus with 5 reviews averaging 4.4.',
    recommendation: 'Safe to Fund',
    strengths: [
      'KRAS is a high-impact oncology target with clear therapeutic need',
      'Strong peer review consensus: 5 reviews averaging 4.4/5',
      'Reproducible workflow design aligns perfectly with grant requirements',
      'Modest $5K budget — excellent value for the expected output',
    ],
    concerns: [
      'KRAS G12C pocket is well-studied — novelty of screening may be incremental',
      'No funding raised yet — needs visibility',
    ],
    humanReviews: [
      {
        reviewerName: 'Dr. Anand Patel',
        institution: 'University of Cambridge',
        score: 4.5,
        comment:
          'Excellent choice of target and clear methodology. The head-to-head comparison of Boltz-2 vs AutoDock Vina will be very informative for the field.',
        date: '2026-04-03',
      },
      {
        reviewerName: 'Dr. Maria Santos',
        institution: 'ETH Zurich',
        score: 4.5,
        comment:
          'Well-structured proposal with strong reproducibility focus. The KRAS target ensures clinical relevance.',
        date: '2026-04-04',
      },
      {
        reviewerName: 'Dr. Wei Zhang',
        institution: 'Tsinghua University',
        score: 4.0,
        comment:
          'Solid computational design. Would benefit from including additional ML methods beyond Boltz-2 for a more comprehensive comparison.',
        date: '2026-04-05',
      },
    ],
  },
  updates: [
    {
      id: 'hs-1',
      headline: 'KRAS drug screening proposal receives 5 peer reviews averaging 4.4',
      source: 'ResearchHub',
      sourceType: 'publication',
      date: '2026-04-05',
      url: 'https://www.researchhub.com/proposal/32102/a-reproducible-comparison-of-machine-learning-and-classical-docking-approaches-for-in-silico-drug-screening-on-kras',
      excerpt:
        "Harshit Kumar Soni's KRAS screening proposal is the top-rated submission with strong reviewer consensus.",
      type: 'publication',
      researcherName: 'Harshit Kumar Soni',
    },
    {
      id: 'hs-2',
      headline: 'Computational drug discovery proposal targets KRAS oncogene',
      source: 'ResearchHub',
      sourceType: 'x',
      date: '2026-04-02',
      url: 'https://x.com/ResearchHub/status/1961107921070358902',
      excerpt:
        'A head-to-head comparison of Boltz-2 vs AutoDock Vina for KRAS drug screening — open science at its best.',
      type: 'social',
      researcherName: 'Harshit Kumar Soni',
    },
    {
      id: 'hs-3',
      headline: 'Drug Target Review covers emerging computational methods for KRAS',
      source: 'Drug Target Review',
      sourceType: 'media',
      date: '2026-03-25',
      url: 'https://www.drugtargetreview.com/news/187869/new-stem-cell-approach-could-repair-stroke-damaged-brains/',
      excerpt:
        'ML-based docking methods are gaining traction in oncology drug discovery, with KRAS remaining a key target.',
      type: 'media',
      researcherName: 'Harshit Kumar Soni',
    },
    {
      id: 'hs-4',
      headline: 'Open-source drug screening workflows gaining momentum in DeSci',
      source: 'Bio Protocol',
      sourceType: 'x',
      date: '2026-03-20',
      url: 'https://x.com/BioProtocol/status/1962606296969990524',
      excerpt:
        'The DeSci community is embracing open-access computational drug discovery with reproducible workflows.',
      type: 'social',
      researcherName: 'Bio Protocol',
    },
  ],
};

export const MOCK_GRANT_2: GrantSummary = {
  id: 304,
  postId: 31919,
  title: 'In Silico Drug Screening',
  shortTitle: 'In Silico Drug Screening',
  organization: 'ResearchHub Foundation',
  slug: 'in-silico-drug-screening',
  previewImage:
    'https://storage.prod.researchhub.com/uploads/posts/users/39602/d2d223cc-2869-4993-a661-31245a65d763/screenshot-2026-04-07-at-1.png',
  budgetAmount: { usd: 5000, rsc: 87361 },
  distributedAmount: { usd: 0, rsc: 0 },
  matchedAmount: { usd: 10, rsc: 177 },
  status: 'OPEN',
  isActive: true,
  proposals: [proposalHarshitSoni, proposalJuanOsuna],
};

// ─── Funded Researchers ──────────────────────────────────────────

export interface FundedResearcher {
  id: number;
  fullName: string;
  institution: string;
  avatarUrl?: string;
  initials: string;
}

export const MOCK_FUNDED_RESEARCHERS: FundedResearcher[] = [
  {
    id: 1,
    fullName: 'John Gray',
    institution: 'UC Davis',
    initials: 'JG',
    avatarUrl: 'https://i.pravatar.cc/80?u=john-gray',
  },
  {
    id: 2,
    fullName: 'Ruslan Rust',
    institution: 'USC Keck',
    initials: 'RR',
    avatarUrl: 'https://i.pravatar.cc/80?u=ruslan-rust',
  },
  {
    id: 3,
    fullName: 'Nick Denomme',
    institution: 'Stanford',
    initials: 'ND',
    avatarUrl: 'https://i.pravatar.cc/80?u=nick-denomme',
  },
  {
    id: 4,
    fullName: 'Fadel Zeidan',
    institution: 'UC San Diego',
    initials: 'FZ',
    avatarUrl: 'https://i.pravatar.cc/80?u=fadel-zeidan',
  },
  {
    id: 5,
    fullName: 'Guy Fincham',
    institution: 'Brighton & Sussex',
    initials: 'GF',
    avatarUrl: 'https://i.pravatar.cc/80?u=guy-fincham',
  },
  {
    id: 6,
    fullName: 'Richard Harris',
    institution: 'UC Irvine',
    initials: 'RH',
    avatarUrl: 'https://i.pravatar.cc/80?u=richard-harris',
  },
  {
    id: 7,
    fullName: 'Harshit Soni',
    institution: 'U of Pune',
    initials: 'HS',
    avatarUrl: 'https://i.pravatar.cc/80?u=harshit-soni',
  },
  {
    id: 8,
    fullName: 'Juan Osuna-Ramos',
    institution: 'IPN Mexico',
    initials: 'JO',
    avatarUrl: 'https://i.pravatar.cc/80?u=juan-osuna',
  },
  {
    id: 9,
    fullName: 'David Olson',
    institution: 'UC Davis',
    initials: 'DO',
    avatarUrl: 'https://i.pravatar.cc/80?u=david-olson',
  },
  {
    id: 10,
    fullName: 'Robin Carhart-Harris',
    institution: 'UCSF',
    initials: 'RC',
    avatarUrl: 'https://i.pravatar.cc/80?u=robin-ch',
  },
  {
    id: 11,
    fullName: 'Amanda Fielding',
    institution: 'Beckley Foundation',
    initials: 'AF',
    avatarUrl: 'https://i.pravatar.cc/80?u=amanda-fielding',
  },
  {
    id: 12,
    fullName: 'Patricia Gerbarg',
    institution: 'NY Medical College',
    initials: 'PG',
    avatarUrl: 'https://i.pravatar.cc/80?u=patricia-gerbarg',
  },
  {
    id: 13,
    fullName: 'Sarah Chen',
    institution: 'Harvard',
    initials: 'SC',
    avatarUrl: 'https://i.pravatar.cc/80?u=sarah-chen',
  },
  {
    id: 14,
    fullName: 'Elena Vasquez',
    institution: 'Albert Einstein',
    initials: 'EV',
    avatarUrl: 'https://i.pravatar.cc/80?u=elena-vasquez',
  },
  {
    id: 15,
    fullName: 'David Bhatt',
    institution: 'Mount Sinai',
    initials: 'DB',
    avatarUrl: 'https://i.pravatar.cc/80?u=david-bhatt',
  },
  {
    id: 16,
    fullName: 'Lisa Chen',
    institution: 'UCLA',
    initials: 'LC',
    avatarUrl: 'https://i.pravatar.cc/80?u=lisa-chen',
  },
  {
    id: 17,
    fullName: 'Ahmed Hassan',
    institution: 'Mayo Clinic',
    initials: 'AH',
    avatarUrl: 'https://i.pravatar.cc/80?u=ahmed-hassan',
  },
  {
    id: 18,
    fullName: 'Wei Zhang',
    institution: 'Tsinghua',
    initials: 'WZ',
    avatarUrl: 'https://i.pravatar.cc/80?u=wei-zhang',
  },
  {
    id: 19,
    fullName: 'Anand Patel',
    institution: 'Cambridge',
    initials: 'AP',
    avatarUrl: 'https://i.pravatar.cc/80?u=anand-patel',
  },
  {
    id: 20,
    fullName: 'Maria Santos',
    institution: 'ETH Zurich',
    initials: 'MS',
    avatarUrl: 'https://i.pravatar.cc/80?u=maria-santos',
  },
];

// ─── All stories flattened & sorted by date ──────────────────────

export function getAllStories(grant: GrantSummary): StoryUpdate[] {
  const all = grant.proposals.flatMap((p) => p.updates.map((u) => ({ ...u, proposalId: p.id })));
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPrimaryStory(grant: GrantSummary): StoryUpdate | undefined {
  const stories = getAllStories(grant);
  // Prefer embeddable stories (tiktok/linkedin), then media/publication, then any
  const embed = stories.find((s) => s.embedType);
  if (embed) return embed;
  const media = stories.find((s) => s.type === 'media' || s.type === 'publication');
  return media || stories[0];
}

export function getSecondaryStories(
  grant: GrantSummary,
  primaryId?: string,
  limit = 5
): StoryUpdate[] {
  return getAllStories(grant)
    .filter((s) => s.id !== primaryId)
    .slice(0, limit);
}

// ─── Helpers ──────────────────────────────────────────────────────

export function getFundingQualityConfig(quality: FundingQuality) {
  switch (quality) {
    case 'safe':
      return {
        label: 'Safe to Fund',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'caution':
      return {
        label: 'Use Caution',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'unsafe':
      return {
        label: 'Unsafe to Fund',
        className: 'bg-red-50 text-red-700 border-red-200',
        dotClass: 'bg-red-500',
      };
  }
}

export function getSourceIcon(sourceType: StoryUpdate['sourceType']): string {
  switch (sourceType) {
    case 'x':
      return '𝕏';
    case 'linkedin':
      return 'in';
    case 'tiktok':
      return '♪';
    case 'instagram':
      return '📷';
    case 'media':
      return '📰';
    case 'publication':
      return '📄';
    default:
      return '🔗';
  }
}

export function formatStoryDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
