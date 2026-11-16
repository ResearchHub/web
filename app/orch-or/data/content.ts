/**
 * The science on the Orch OR page: the theory's four links, the open
 * questions, the timeline, the FAQ and the sources. Facts come from
 * docs/orch-or-rfp-landing-plan.md (sections 2 to 4 and 10). RFP facts
 * (amount, deadline, funder) are not here; they live in `mockRfp.ts`.
 */

export type SceneId = 'superradiance' | 'wigner' | 'anesthesia' | 'spacetime' | 'raster';

export interface Source {
  id: number;
  label: string;
  url: string;
}

export const SOURCES: Source[] = [
  {
    id: 1,
    label:
      'Hameroff, “Orch OR is the most complete, and most easily falsifiable theory of consciousness”, Cognitive Neuroscience, 2020',
    url: 'https://www.tandfonline.com/doi/pdf/10.1080/17588928.2020.1839037',
  },
  {
    id: 2,
    label: 'Tegmark, “Importance of quantum decoherence in brain processes”, Phys. Rev. E, 2000',
    url: 'https://arxiv.org/abs/quant-ph/0005025',
  },
  {
    id: 3,
    label:
      'Hagan, Hameroff and Tuszyński, “Quantum computation in brain microtubules: decoherence and biological feasibility”, Phys. Rev. E, 2002',
    url: 'https://www.doi.org/10.1103/PHYSREVE.65.061901',
  },
  {
    id: 4,
    label:
      'McKemmish et al., “Penrose–Hameroff orchestrated objective-reduction proposal for human consciousness is not biologically feasible”, Phys. Rev. E, 2009',
    url: 'https://link.aps.org/doi/10.1103/PhysRevE.80.021912',
  },
  {
    id: 5,
    label: 'Reimers et al., PNAS, 2009 (coverage, phys.org)',
    url: 'https://phys.org/news155904395.html',
  },
  {
    id: 6,
    label:
      'Donadi et al., “Underground test of gravity-related wave function collapse”, Nature Physics, 2020',
    url: 'https://www.nature.com/articles/s41567-020-1008-4.pdf',
  },
  {
    id: 7,
    label:
      'Derakhshani et al., Physics of Life Reviews, 2022 (the underground result and Penrose’s own version of collapse)',
    url: 'https://arxiv.org/pdf/2111.13490',
  },
  {
    id: 8,
    label: 'Kalra et al., “Electronic energy migration in microtubules”, ACS Central Science, 2023',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10037452/',
  },
  {
    id: 9,
    label:
      'Babcock et al., “Ultraviolet superradiance from mega-networks of tryptophan in biological architectures”, J. Phys. Chem. B, 2024',
    url: 'https://arxiv.org/abs/2302.01469',
  },
  {
    id: 10,
    label: 'Sahu et al., Biosensors and Bioelectronics, 2013 (resonances in single microtubules)',
    url: 'https://research.iitj.ac.in/pdf/postprint-atomic-water-channel-controlling-remarkable-properties',
  },
  {
    id: 11,
    label:
      'Microtubule-stabilizer epothilone B delays anesthetic-induced unconsciousness in rats, eNeuro, 2024',
    url: 'https://www.eneuro.org/content/11/8/eneuro.0291-24.2024',
  },
  {
    id: 12,
    label:
      'Li et al., “Nuclear spin attenuates the anesthetic potency of xenon isotopes in mice”, Anesthesiology, 2018',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29642079/',
  },
  {
    id: 13,
    label:
      'Wiest, “A quantum microtubule substrate of consciousness is experimentally supported and solves the binding and epiphenomenalism problems”, Neuroscience of Consciousness, 2025',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12060853/',
  },
  {
    id: 14,
    label:
      'Neven et al., “Testing the conjecture that quantum processes create conscious experience”, Entropy, 2024',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11203236/',
  },
  {
    id: 15,
    label:
      'Kerskens and López Pérez, “Experimental indications of non-classical brain functions”, 2022',
    url: 'https://arxiv.org/abs/1806.07998v6',
  },
  {
    id: 16,
    label:
      'Smith et al., “Radical pairs may play a role in xenon-induced general anesthesia”, Scientific Reports, 2021',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7973516/',
  },
  {
    id: 17,
    label: '“Quantum effects in the brain: a review”, 2019',
    url: 'https://arxiv.org/pdf/1910.08423',
  },
  {
    id: 18,
    label: 'Orchestrated objective reduction, Wikipedia (overview of the theory and its critics)',
    url: 'https://en.wikipedia.org/wiki/Orchestrated_objective_reduction',
  },
  {
    id: 19,
    label: 'Hameroff, research overview and falsification criteria, University of Arizona',
    url: 'https://hameroff.arizona.edu/research-overview/orch-or',
  },
  {
    id: 20,
    label:
      'Physics World, “Quantum theory of consciousness put in doubt by underground experiment”, 2020',
    url: 'https://physicsworld.com/a/quantum-theory-of-consciousness-put-in-doubt-by-underground-experiment/',
  },
];

export interface Link {
  n: number;
  name: string;
  claim: string;
}

/** The theory as a chain of four claims. */
export const LINKS: Link[] = [
  {
    n: 1,
    name: 'Non-computability',
    claim:
      'Penrose argues from Gödel’s theorem that understanding is not an algorithm, so the brain must use physics beyond computation.',
  },
  {
    n: 2,
    name: 'Objective reduction',
    claim:
      'Gravity makes a quantum superposition unstable, so it collapses on its own. Each collapse, Penrose proposes, is a moment of experience.',
  },
  {
    n: 3,
    name: 'Microtubules',
    claim:
      'In the brain, those collapses happen in microtubules: protein tubes 25 nm wide inside every neuron.',
  },
  {
    n: 4,
    name: 'Orchestration',
    claim:
      'Brain activity tunes the collapses into rhythms that shape neuron firing. Anesthetics, on this view, work by damping them.',
  },
];

export interface Photo {
  /** Under /public. */
  src: string;
  author: string;
  licence: string;
  licenceUrl: string;
  /** The file's page on Wikimedia Commons. */
  sourceUrl: string;
}

export interface Moment {
  year: string;
  /** Supports the theory, challenges it, or neither: the theory itself, or a rival. */
  side: 'for' | 'against' | 'theory' | 'rival';
  text: string;
  /** Who wrote the cited work, as shown under the entry. */
  cite: string;
  sources: number[];
  /** A freely licensed photo of an author of the cited work... */
  person?: { name: string; photo: Photo };
  /** ...or, where there is none, the paper. */
  paper?: { journal: string; title: string };
}

/**
 * Six moments, oldest first (the row reads left to right, newest on the
 * right): the theory itself, two results that support it, two that challenge
 * it, and a rival. People appear as authors of the work cited, not as
 * endorsers of this call. Where the first author has no freely licensed
 * photo, a co-author's is used and named in `cite`. Photos: Wikimedia
 * Commons, credited on the page and in public/orch-or/CREDITS.md.
 */
export const TIMELINE: Moment[] = [
  {
    year: '1996',
    side: 'theory',
    text: 'Orch OR is proposed: moments of experience as gravity-driven collapses in microtubules.',
    cite: 'Hameroff and Penrose',
    sources: [18],
    person: {
      name: 'Roger Penrose',
      photo: {
        src: '/orch-or/people/penrose.jpg',
        author: 'Andrej Bauer',
        licence: 'CC BY-SA 2.5 SI',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.5/si/deed.en',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Roger_Penrose_June_2007.jpg',
      },
    },
  },
  {
    year: '2000',
    side: 'against',
    text: 'A quantum state in a microtubule should decohere in about 10⁻¹³ s, far too fast to matter.',
    cite: 'Tegmark, Phys. Rev. E',
    sources: [2],
    person: {
      name: 'Max Tegmark',
      photo: {
        src: '/orch-or/people/tegmark.jpg',
        author: 'Web Summit',
        licence: 'CC BY 2.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Max_Tegmark_2024_(cropped).jpg',
      },
    },
  },
  {
    year: '2002',
    side: 'for',
    text: 'A corrected model: coherence could last 10⁻⁵ to 10⁻⁴ s, not 10⁻¹³ s.',
    cite: 'Hagan, Hameroff and Tuszyński, Phys. Rev. E',
    sources: [3],
    person: {
      name: 'Stuart Hameroff',
      photo: {
        src: '/orch-or/people/hameroff.jpg',
        author: 'Zereshk',
        licence: 'CC BY 3.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Stuart_Hameroff_TASC2008.JPG',
      },
    },
  },
  {
    year: '2020',
    side: 'against',
    text: 'Underground, no sign of collapse radiation: the simplest gravity-collapse model is ruled out. Penrose’s own version survives.',
    cite: 'Donadi, Curceanu et al., Nature Physics',
    sources: [6, 7],
    person: {
      name: 'Catalina Curceanu',
      photo: {
        src: '/orch-or/people/curceanu.jpg',
        author: 'Libreria Assaggi',
        licence: 'CC BY 3.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl:
          'https://commons.wikimedia.org/wiki/File:Catalina_Curceanu,_Nelle_segrete_stanze_V.jpg',
      },
    },
  },
  {
    year: '2024',
    side: 'for',
    text: 'Tryptophan networks in tubulin radiate together, a quantum effect that survives heat. In vitro.',
    cite: 'Babcock, Chergui, Kurian et al., J. Phys. Chem. B',
    sources: [9],
    person: {
      name: 'Majed Chergui',
      photo: {
        src: '/orch-or/people/chergui.jpg',
        author: 'EPFL-MEDIACOM',
        licence: 'CC BY 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:EPFL_2020_Majed_Chergui_Portrait_1.jpg',
      },
    },
  },
  {
    year: '2024',
    side: 'rival',
    text: 'A rival test: experience arises when superpositions form, not when they collapse.',
    cite: 'Neven, Koch et al., Entropy',
    sources: [14],
    person: {
      name: 'Christof Koch',
      photo: {
        src: '/orch-or/people/koch.jpg',
        author: 'Zereshk',
        licence: 'CC BY 3.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Koch_TASC2008.JPG',
      },
    },
  },
];

export interface Question {
  id: string;
  scene: SceneId;
  /** Short name, for the empty proposal slots. */
  name: string;
  question: string;
  known: string;
  countsFor: string;
  countsAgainst: string;
  figure: { caption: string; legend: { label: string; tone: 'a' | 'b' | 'w' | 'f' }[] };
  sources: number[];
}

/** Five open questions, each with a figure. The sixth, the case against, is text only. */
export const QUESTIONS: Question[] = [
  {
    id: 'anesthesia',
    scene: 'anesthesia',
    name: 'Anesthesia',
    question: 'Do anesthetics switch off consciousness through microtubules?',
    known:
      'Rats given a microtubule-stabilising drug took about a minute longer to go under (2024), and xenon isotopes with nuclear spin were weaker anesthetics in mice (2018). Neither result has been replicated.',
    countsFor: 'Both effects replicate across labs and anesthetics.',
    countsAgainst: 'Replications fail, or ordinary pharmacology explains them.',
    figure: {
      caption: 'Anesthetic settling into the microtubule wall and damping a modelled oscillation.',
      legend: [
        { label: 'Tubulin', tone: 'w' },
        { label: 'Anesthetic', tone: 'b' },
        { label: 'Oscillation', tone: 'a' },
      ],
    },
    sources: [11, 12],
  },
  {
    id: 'quantum-states',
    scene: 'superradiance',
    name: 'Quantum states in microtubules',
    question: 'Do microtubules hold quantum states at body temperature, in living cells?',
    known:
      'In the lab, light energy travels further along microtubules than expected (2023), and tryptophan networks in tubulin radiate together, a quantum optical effect called superradiance (2024). Neither has been seen in a neuron.',
    countsFor: 'The same effects measured in living neurons, and replicated.',
    countsAgainst: 'They vanish in cells, or a classical model explains them.',
    figure: {
      caption:
        'A microtubule, its open end showing 13 strands round a hollow core. Tryptophans emitting on their own glow faintly; in step, they flash brighter and faster (superradiance). Schematic.',
      legend: [
        { label: 'Tubulin', tone: 'w' },
        { label: 'Emitting on their own', tone: 'b' },
        { label: 'Emitting in step', tone: 'a' },
      ],
    },
    sources: [8, 9],
  },
  {
    id: 'decoherence',
    scene: 'wigner',
    name: 'Decoherence',
    question: 'How long can a quantum state survive in a warm, wet brain?',
    known:
      'Estimates run from 10⁻¹³ s to 10⁻⁵–10⁻⁴ s, against the roughly 25 ms the theory first needed. Nobody has measured it in a neuron.',
    countsFor: 'A measured lifetime near 10⁻⁵ s or longer.',
    countsAgainst: 'A measured lifetime near 10⁻¹³ s.',
    figure: {
      caption:
        'The two published estimates on one clock: how long a state in two places at once lasts among jostling water molecules before it settles into one place.',
      legend: [
        { label: 'Place A', tone: 'a' },
        { label: 'Place B', tone: 'b' },
        { label: 'Both at once', tone: 'w' },
      ],
    },
    sources: [2, 3],
  },
  {
    id: 'objective-reduction',
    scene: 'spacetime',
    name: 'Objective reduction',
    question: 'Does gravity collapse quantum states at the rate Penrose predicts?',
    known:
      'An underground test in 2020 ruled out the simplest gravity-collapse model. Penrose’s own version survives, and sharper tests are being prepared.',
    countsFor: 'A collapse signature at the predicted rate, τ ≈ ħ/E_G.',
    countsAgainst: 'Bounds that rule out Penrose’s version too.',
    figure: {
      caption:
        'One mass in two places bends spacetime two ways; Penrose proposes one wins. Never observed.',
      legend: [
        { label: 'Geometry A', tone: 'a' },
        { label: 'Geometry B', tone: 'b' },
        { label: 'After collapse', tone: 'w' },
      ],
    },
    sources: [6, 7],
  },
  {
    id: 'microtubule-to-mind',
    scene: 'raster',
    name: 'From microtubule to mind',
    question: 'If these states exist, do they change what neurons do?',
    known:
      'The theory ties collapses to brain rhythms such as 40 Hz gamma. No causal path from a microtubule’s quantum state to a neuron firing has been shown.',
    countsFor: 'Perturbing microtubule states shifts firing or gamma rhythm as predicted.',
    countsAgainst: 'No effect on firing, or brain microtubules built wrong for the theory.',
    figure: {
      caption:
        'Neurons drifting from scattered firing into a 40 Hz gamma rhythm, slowed a hundred times.',
      legend: [
        { label: 'Spikes', tone: 'f' },
        { label: 'Gamma cycle', tone: 'a' },
        { label: 'Summed field', tone: 'b' },
      ],
    },
    sources: [1, 19],
  },
];

export interface Faq {
  q: string;
  a: string;
  placeholder?: boolean;
}

export const FAQ: Faq[] = [
  {
    q: 'What makes a strong proposal?',
    a: 'It says, before the data, what result would count against its own view. It is pre-registered, reruns a single-lab claim before building on it, shares data and code, and is sized to the question. A collaborator who expects the opposite outcome makes it stronger.',
  },
  {
    q: 'Do you fund critics of Orch OR?',
    a: 'Yes, on the same terms as supporters. A proposal designed to break a link in the theory is as welcome as one designed to support it, and a well-run null result is a result.',
  },
  {
    q: 'Is theory-only work in scope?',
    a: 'Yes, when it tightens or breaks a link: a calculation of E_G for tubulin, a decoherence model both sides accept, or a formal analysis of the Gödel argument.',
  },
  {
    q: 'Who can apply?',
    a: '[Placeholder] Eligibility (academic and non-academic applicants, countries, career stage) is to be confirmed with the Athanatos Foundation.',
    placeholder: true,
  },
  {
    q: 'How large are awards, and is overhead allowed?',
    a: '[Placeholder] Award range and overhead policy are to be confirmed with the Athanatos Foundation.',
    placeholder: true,
  },
  {
    q: 'How are decisions made?',
    a: 'Proposals are published on ResearchHub and open to peer review. The Athanatos Foundation chooses which to fund. [Placeholder: named reviewers or advisors, if any.]',
  },
  {
    q: 'What about IP and publishing?',
    a: '[Placeholder] To be confirmed. ResearchHub proposals are public, and open data and methods are expected of funded work.',
    placeholder: true,
  },
  {
    q: 'Where does money added to the pool go?',
    a: 'Only to proposals the Athanatos Foundation funds under this call.',
  },
];
