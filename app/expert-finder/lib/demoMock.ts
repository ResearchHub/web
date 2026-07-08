/**
 * Throwaway demo mocks for the Expert Finder flow.
 *
 * These let the entire "Find experts" journey run without a backend: a search
 * is "created", a short fake progress stream plays, and a curated result set is
 * returned. All of this is keyed off DEMO_SEARCH_ID so real searches (by any
 * other id) still hit the API untouched.
 */
import type {
  ExpertResult,
  ExpertSearchCreated,
  ExpertSearchResult,
  GeneratedEmail,
} from '@/types/expertFinder';
import type { Work } from '@/types/work';

export const DEMO_SEARCH_ID = 990001;

// First generated-email id in the mock store. Real backend ids start much
// lower, so any id at/above this is unambiguously a demo email.
const DEMO_EMAIL_ID_START = 900001;

// Mock work (the funding opportunity the search was run against). Cast loosely
// since RelatedWorkCard only reads a handful of guarded fields.
const DEMO_WORK = {
  id: 32331,
  contentType: 'funding_request',
  title: 'Barriers to remyelination and CNS repair in Multiple Sclerosis',
  slug: 'neurodevelopmental-and-neuropsychiatric-conditions',
  createdDate: '2026-07-05T00:00:00Z',
  authors: [
    {
      authorProfile: {
        fullName: 'The Myelin Repair Foundation',
        profileUrl: '#',
        user: { isVerified: true },
      },
    },
  ],
  abstract:
    'Understanding why remyelination fails in multiple sclerosis (MS), and how it might be restarted.',
  topics: [
    { id: 1, name: 'Multiple Sclerosis', slug: 'multiple-sclerosis' },
    { id: 2, name: 'Neuroscience', slug: 'neuroscience' },
  ],
  formats: [],
  figures: [],
  unifiedDocumentId: 32331,
} as unknown as Work;

export function isDemoSearchId(searchId: number | string | null | undefined): boolean {
  if (searchId == null) return false;
  return String(searchId) === String(DEMO_SEARCH_ID);
}

const DEMO_EXPERTS: ExpertResult[] = [
  {
    expertId: null,
    honorific: 'Dr.',
    firstName: 'Huda',
    middleName: '',
    lastName: 'Zoghbi',
    nameSuffix: '',
    name: 'Huda Zoghbi',
    title: 'Professor of Molecular & Human Genetics; Investigator, HHMI',
    affiliation: 'Baylor College of Medicine',
    expertise:
      'Neurodevelopmental disorders, Rett syndrome, MECP2, autism spectrum disorders, neurogenetics',
    email: 'hzoghbi@demo-researchhub.org',
    lastEmailSentAt: null,
    notes:
      'A foundational leader in neurodevelopmental disease genetics whose discovery of the MECP2 basis of Rett syndrome reshaped the field. Her lab bridges mechanism and therapeutic strategy, making her an authoritative reviewer for proposals spanning neurodevelopmental and neuropsychiatric conditions.',
    sources: [
      { url: 'https://scholar.google.com', text: 'Google Scholar' },
      { url: 'https://orcid.org', text: 'ORCID' },
    ],
  },
  {
    expertId: null,
    honorific: 'Dr.',
    firstName: 'Ruslan',
    middleName: '',
    lastName: 'Rust',
    nameSuffix: '',
    name: 'Ruslan Rust',
    title: 'Assistant Professor',
    affiliation: 'University of Southern California (USC)',
    expertise:
      'Blood-brain barrier, advanced cell therapies, genetic engineering, stroke, brain injury, vascular regeneration',
    email: 'ruslan.rust@demo-researchhub.org',
    lastEmailSentAt: null,
    notes:
      'Specializes in the blood-brain barrier, advanced cell therapies, and genetic engineering for stroke and other brain injuries. His translational work on vascular repair and regeneration is a strong fit for proposals targeting neurovascular mechanisms of neurodevelopmental and neuropsychiatric conditions.',
    sources: [
      { url: 'https://scholar.google.com', text: 'Google Scholar' },
      { url: 'https://orcid.org/0000-0003-3376-3453', text: 'ORCID' },
    ],
  },
  {
    expertId: null,
    honorific: 'Dr.',
    firstName: 'Mustafa',
    middleName: '',
    lastName: 'Sahin',
    nameSuffix: '',
    name: 'Mustafa Sahin',
    title:
      'Professor of Neurology; Director, Rosamund Stone Zander Translational Neuroscience Center',
    affiliation: "Boston Children's Hospital / Harvard Medical School",
    expertise:
      'Tuberous sclerosis, autism, synaptic dysfunction, translational neuroscience, clinical trials',
    email: 'mustafa.sahin@demo-researchhub.org',
    lastEmailSentAt: null,
    notes:
      'Runs a translational program connecting molecular mechanisms of neurodevelopmental disorders to early-phase clinical trials, offering rare depth on both mechanism and clinical endpoints.',
    sources: [
      { url: 'https://scholar.google.com', text: 'Google Scholar' },
      { url: 'https://orcid.org', text: 'ORCID' },
    ],
  },
  {
    expertId: null,
    honorific: 'Dr.',
    firstName: 'Kevin',
    middleName: 'J.',
    lastName: 'Bender',
    nameSuffix: '',
    name: 'Kevin J. Bender',
    title: 'Professor, Department of Neurology',
    affiliation: 'University of California, San Francisco (UCSF)',
    expertise:
      'Neuronal excitability, ion channels, autism-associated mutations, dendritic signaling, electrophysiology',
    email: 'kevin.bender@demo-researchhub.org',
    lastEmailSentAt: null,
    notes:
      'Studies how autism- and neuropsychiatric-associated mutations alter neuronal excitability at the circuit level, providing mechanistic rigor for physiology-focused review.',
    sources: [
      { url: 'https://scholar.google.com', text: 'Google Scholar' },
      { url: 'https://orcid.org', text: 'ORCID' },
    ],
  },
  {
    expertId: null,
    honorific: 'Dr.',
    firstName: 'Lauren',
    middleName: 'A.',
    lastName: 'Weiss',
    nameSuffix: '',
    name: 'Lauren A. Weiss',
    title: 'Professor, Institute for Human Genetics',
    affiliation: 'University of California, San Francisco (UCSF)',
    expertise:
      'Human genetics, copy number variation, autism, neuropsychiatric genetics, statistical genomics',
    email: 'lauren.weiss@demo-researchhub.org',
    lastEmailSentAt: null,
    notes:
      'Leading voice in the genetic architecture of neuropsychiatric conditions with expertise in large-cohort statistical genomics, valuable for evaluating population-scale study designs.',
    sources: [
      { url: 'https://scholar.google.com', text: 'Google Scholar' },
      { url: 'https://orcid.org', text: 'ORCID' },
    ],
  },
  {
    expertId: null,
    honorific: 'Dr.',
    firstName: 'Sergiu',
    middleName: 'P.',
    lastName: 'Pașca',
    nameSuffix: '',
    name: 'Sergiu P. Pașca',
    title: 'Professor of Psychiatry and Behavioral Sciences',
    affiliation: 'Stanford University',
    expertise:
      'Human brain organoids, assembloids, neural circuit development, in vitro disease modeling, neurodevelopment',
    email: 'sergiu.pasca@demo-researchhub.org',
    lastEmailSentAt: null,
    notes:
      'Pioneer of human brain organoid and assembloid models used to dissect neurodevelopmental disease, offering cutting-edge in vitro modeling perspective for the proposed work.',
    sources: [
      { url: 'https://scholar.google.com', text: 'Google Scholar' },
      { url: 'https://orcid.org', text: 'ORCID' },
    ],
  },
];

export function getDemoCreatedResponse(): ExpertSearchCreated {
  return {
    searchId: DEMO_SEARCH_ID,
    status: 'processing',
    message: 'Expert search started',
    sseUrl: null,
  };
}

export function getDemoSearchResult(): ExpertSearchResult {
  const now = new Date().toISOString();
  return {
    searchId: DEMO_SEARCH_ID,
    name: 'Experts for Neurodevelopmental & Neuropsychiatric Conditions',
    query: 'Neurodevelopmental and neuropsychiatric conditions',
    inputType: 'full_content',
    config: {
      expert_count: DEMO_EXPERTS.length,
      expertise_level: [],
      region: 'all_regions',
      state: '',
    },
    excludedSearchIds: [],
    llmModel: 'demo',
    status: 'completed',
    progress: 100,
    currentStep: 'Completed',
    expertResults: DEMO_EXPERTS,
    expertCount: DEMO_EXPERTS.length,
    reportUrls: { pdf: '#', csv: '#' },
    reportPdfUrl: '#',
    reportCsvUrl: '#',
    processingTime: 42,
    errorMessage: '',
    createdAt: now,
    updatedAt: now,
    completedAt: now,
    work: DEMO_WORK,
    additionalContext: '',
    createdBy: {
      userId: 1,
      author: { id: 0, fullName: 'Kobe Attias' },
    } as unknown as ExpertSearchResult['createdBy'],
  };
}

// ── Mocked generated emails (outreach) ──────────────────────────────────────
//
// Backs the "Generate emails" -> success -> Outreach tab -> edit -> Send flow
// entirely client-side, so the demo search's fabricated expert_search_id
// never has to hit the real backend. State lives for the tab's lifetime only
// (resets on reload), which is fine for a demo.

let demoGeneratedEmails: GeneratedEmail[] = [];
let demoEmailIdCounter = DEMO_EMAIL_ID_START;

export function isDemoGeneratedEmailId(id: number | string | null | undefined): boolean {
  if (id == null) return false;
  const n = Number(id);
  return Number.isFinite(n) && n >= DEMO_EMAIL_ID_START;
}

function findDemoExpertByEmail(email: string): ExpertResult | undefined {
  const target = email.trim().toLowerCase();
  return DEMO_EXPERTS.find((e) => e.email.trim().toLowerCase() === target);
}

function buildDemoEmailContent(params: {
  expert: ExpertResult | undefined;
  autoGenerateProposal?: boolean;
}): { subject: string; body: string } {
  const { expert, autoGenerateProposal } = params;
  const firstName = expert?.firstName?.trim() || expert?.name?.split(' ')[0] || 'there';
  const work = getDemoSearchResult().work;
  const opportunityTitle = work?.title ?? 'our open call for proposals';

  const subject = `Invitation to apply: ${opportunityTitle}`;

  const proposalParagraph = autoGenerateProposal
    ? `<p>To make it easier to get started, we&rsquo;ve drafted a personalized preregistration proposal based on your ORCID and OpenAlex publication history &mdash; it&rsquo;s ready for you to review, edit, and submit: <a href="/notebook/proposal-demo">View your draft proposal</a>.</p>`
    : '';

  const body =
    `<p>Hi ${firstName},</p>` +
    `<p>We came across your work${expert?.expertise ? ` on ${expert.expertise.split(',')[0].trim().toLowerCase()}` : ''} and think it aligns closely with <strong>${opportunityTitle}</strong>, a funding opportunity from the ResearchHub Foundation.</p>` +
    proposalParagraph +
    `<p>Would you be open to submitting a proposal, or sharing this with colleagues who might be a good fit?</p>` +
    `<p>Best,<br/>The ResearchHub Foundation team</p>`;

  return { subject, body };
}

/** Create a mocked draft email for the demo search, mirroring the real generate-email response shape. */
export function createDemoGeneratedEmail(payload: {
  expert_email: string;
  template?: string | null;
  auto_generate_proposal?: boolean;
  proposal_context?: string;
}): GeneratedEmail {
  const expert = findDemoExpertByEmail(payload.expert_email);
  const { subject, body } = buildDemoEmailContent({
    expert,
    autoGenerateProposal: payload.auto_generate_proposal,
  });
  const now = new Date().toISOString();

  const email: GeneratedEmail = {
    id: demoEmailIdCounter++,
    expertSearch: DEMO_SEARCH_ID,
    expertName: expert?.name ?? '',
    expertTitle: expert?.title ?? '',
    expertAffiliation: expert?.affiliation ?? '',
    expertEmail: payload.expert_email,
    expertise: expert?.expertise ?? '',
    emailSubject: subject,
    emailBody: body,
    template: payload.template ?? null,
    status: 'draft',
    notes: payload.auto_generate_proposal
      ? `Includes an auto-generated proposal draft.${
          payload.proposal_context ? ` Steering notes: ${payload.proposal_context}` : ''
        }`
      : '',
    bouncedAt: null,
    openedAt: null,
    openCount: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: null,
  };

  demoGeneratedEmails = [email, ...demoGeneratedEmails];
  return email;
}

export function listDemoGeneratedEmails(limit: number, offset: number) {
  const all = demoGeneratedEmails;
  return {
    emails: all.slice(offset, offset + limit),
    total: all.length,
  };
}

export function getDemoGeneratedEmail(id: number | string): GeneratedEmail | null {
  const idx = demoGeneratedEmails.findIndex((e) => e.id === Number(id));
  if (idx === -1) return null;
  const total = demoGeneratedEmails.length;
  return {
    ...demoGeneratedEmails[idx],
    listNavigation: {
      total,
      position: idx + 1,
      previousId: idx > 0 ? demoGeneratedEmails[idx - 1].id : null,
      nextId: idx < total - 1 ? demoGeneratedEmails[idx + 1].id : null,
    },
  };
}

export function updateDemoGeneratedEmail(
  id: number | string,
  payload: Record<string, unknown>
): GeneratedEmail | null {
  const idx = demoGeneratedEmails.findIndex((e) => e.id === Number(id));
  if (idx === -1) return null;
  const current = demoGeneratedEmails[idx];
  const updated: GeneratedEmail = {
    ...current,
    emailSubject: (payload.email_subject as string) ?? current.emailSubject,
    emailBody: (payload.email_body as string) ?? current.emailBody,
    status: (payload.status as string) ?? current.status,
    notes: (payload.notes as string) ?? current.notes,
    updatedAt: new Date().toISOString(),
  };
  demoGeneratedEmails[idx] = updated;
  return updated;
}

export function deleteDemoGeneratedEmail(id: number | string): void {
  demoGeneratedEmails = demoGeneratedEmails.filter((e) => e.id !== Number(id));
}

export function markDemoGeneratedEmailsSent(ids: number[]): void {
  const now = new Date().toISOString();
  demoGeneratedEmails = demoGeneratedEmails.map((e) =>
    ids.includes(e.id) ? { ...e, status: 'sent', updatedAt: now } : e
  );
}

/**
 * Build a fake Server-Sent Events response that mimics the progress stream:
 * connected -> processing -> completed, over ~1.8s so the loading state is
 * visible before the detail page redirect.
 */
export function getDemoProgressStream(): Response {
  const encoder = new TextEncoder();
  const frame = (event: string, data: Record<string, unknown>) =>
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(frame('connected', { status: 'connected' }));
      setTimeout(() => {
        controller.enqueue(
          frame('progress', {
            status: 'processing',
            progress: 40,
            current_step: 'Analyzing document and identifying candidate experts',
          })
        );
      }, 400);
      setTimeout(() => {
        controller.enqueue(
          frame('progress', {
            status: 'processing',
            progress: 82,
            current_step: 'Ranking experts by relevance',
          })
        );
      }, 1000);
      setTimeout(() => {
        controller.enqueue(frame('complete', { status: 'completed', progress: 100 }));
        controller.close();
      }, 1800);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
