/**
 * The science on the page: the open problem in four parts (with Orch OR's
 * answer to each), the open questions, the timeline, the FAQ and the sources. Facts are
 * cited in `SOURCES` below. RFP facts
 * (pool, deadline) are not here; they come from the live RFP (`rfp.ts`).
 */

import type { RfpGuide } from '@/components/AIMode/rfpGuide';

export type SceneId = 'superradiance' | 'wigner' | 'anesthesia' | 'spacetime' | 'raster';
/** Figures drawn only in the Poster set; every set shows the Poster one. */
export type PosterOnlySceneId = 'turing';
export type QuestionSceneId = SceneId | PosterOnlySceneId;

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
      'Khan, …, Wiest, “Microtubule-stabilizer epothilone B delays anesthetic-induced unconsciousness in rats”, eNeuro, 2024',
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
  {
    id: 21,
    label:
      'Penrose–Lucas argument, Wikipedia (Penrose’s argument from Gödel’s theorem, and its critics)',
    url: 'https://en.wikipedia.org/wiki/Penrose%E2%80%93Lucas_argument',
  },
  {
    id: 22,
    label: 'Feferman, “Penrose’s Gödelian argument”, Psyche, 1995',
    url: 'https://math.stanford.edu/~feferman/papers/penrose.pdf',
  },
  {
    id: 23,
    label:
      'Dehaene, Lau and Kouider, “What is consciousness, and could machines have it?”, Science, 2017',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29074769/',
  },
  {
    id: 24,
    label:
      'Tononi and Koch, “Consciousness: here, there and everywhere?”, Phil. Trans. R. Soc. B, 2015',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4387509/',
  },
  {
    id: 25,
    label:
      'Butlin, Long et al., “Consciousness in artificial intelligence: insights from the science of consciousness”, 2023',
    url: 'https://arxiv.org/abs/2308.08708',
  },
  {
    id: 26,
    label: 'Van Gulick, “Consciousness”, Stanford Encyclopedia of Philosophy',
    url: 'https://plato.stanford.edu/entries/consciousness/',
  },
  {
    id: 27,
    label:
      'Crick and Koch, “Towards a neurobiological theory of consciousness”, Seminars in the Neurosciences, 1990',
    url: 'https://authors.library.caltech.edu/records/7fap3-5v118',
  },
  {
    id: 28,
    label:
      'Chalmers, “Facing up to the problem of consciousness”, Journal of Consciousness Studies, 1995',
    url: 'https://consc.net/papers/facing.html',
  },
  {
    id: 29,
    label:
      'Hameroff and Penrose, “Orchestrated reduction of quantum coherence in brain microtubules: a model for consciousness”, Mathematics and Computers in Simulation, 1996',
    url: 'https://doi.org/10.1016/0378-4754(96)80476-9',
  },
  {
    id: 30,
    label:
      'Cogitate Consortium, “Adversarial testing of global neuronal workspace and integrated information theories of consciousness”, Nature, 2025',
    url: 'https://doi.org/10.1038/s41586-025-08888-1',
  },
  {
    id: 31,
    label:
      'Lenharo, “Decades-long bet on consciousness ends — and it’s philosopher 1, neuroscientist 0”, Nature news, 2023',
    url: 'https://doi.org/10.1038/d41586-023-02120-8',
  },
  {
    id: 32,
    label: 'Nagel, “What is it like to be a bat?”, Philosophical Review, 1974',
    url: 'https://doi.org/10.2307/2183914',
  },
  {
    id: 33,
    label: 'Searle, “Minds, brains, and programs”, Behavioral and Brain Sciences, 1980',
    url: 'https://doi.org/10.1017/S0140525X00005756',
  },
  {
    id: 34,
    label: 'Baars, A Cognitive Theory of Consciousness, Cambridge University Press, 1988',
    url: 'https://openlibrary.org/works/OL3254300W',
  },
  {
    id: 35,
    label: 'Penrose, The Emperor’s New Mind, Oxford University Press, 1989',
    url: 'https://doi.org/10.1093/oso/9780198519737.001.0001',
  },
  {
    id: 36,
    label:
      'Dehaene and Naccache, “Towards a cognitive neuroscience of consciousness: basic evidence and a workspace framework”, Cognition, 2001',
    url: 'https://doi.org/10.1016/S0010-0277(00)00123-2',
  },
  {
    id: 37,
    label: 'Tononi, “An information integration theory of consciousness”, BMC Neuroscience, 2004',
    url: 'https://doi.org/10.1186/1471-2202-5-42',
  },
  {
    id: 38,
    label: 'Owen et al., “Detecting awareness in the vegetative state”, Science, 2006',
    url: 'https://doi.org/10.1126/science.1130197',
  },
  {
    id: 39,
    label:
      'Casali, …, Tononi, Massimini, “A theoretically based index of consciousness independent of sensory processing and behavior”, Science Translational Medicine, 2013',
    url: 'https://doi.org/10.1126/scitranslmed.3006294',
  },
];

export interface OpenPart {
  n: number;
  name: string;
  text: string;
  /** Orch OR's answer, one line. */
  orchOr: string;
}

/**
 * The open problem of consciousness in four parts, each still unsettled.
 * Orch OR answers all four in one chain; other theories answer them
 * differently, and the page names no camps.
 */
export const OPEN_PROBLEM: OpenPart[] = [
  {
    n: 1,
    name: 'What it is',
    text: 'Science can measure what a brain does. Whether, and what, it feels can only be reported, and there is no agreed test for it.',
    orchOr: 'a stream of discrete moments, each one a quantum event.',
  },
  {
    n: 2,
    name: 'Where it arises',
    text: 'Leading theories point to different places: networks spanning the brain, the back of the cortex, or structures inside neurons. Tests have not settled it.',
    orchOr: 'inside neurons, in microtubules, timed by brain rhythms.',
  },
  {
    n: 3,
    name: 'Whether it needs quantum physics',
    text: 'Most neuroscientists expect ordinary neural activity to be enough. Others argue it is not, against the objection that the brain is too warm for quantum states to last.',
    orchOr: 'yes: experience comes from quantum states that gravity makes collapse.',
  },
  {
    n: 4,
    name: 'Whether it can be computed',
    text: 'If it can, a computer running the right program would be conscious. If not, a brain does something no computer does. Q2 asks how to tell.',
    orchOr: 'no: understanding, Penrose argues, is not an algorithm.',
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
  /** What kind of step it was for the field. */
  kind:
    | 'approach'
    | 'problem'
    | 'argument'
    | 'theory'
    | 'objection'
    | 'finding'
    | 'evidence'
    | 'test';
  text: string;
  /** Who wrote the cited work, as shown under the entry. */
  cite: string;
  sources: number[];
  /**
   * An author of the cited work, with a freely licensed photo where one
   * exists; without one, the page shows the moment's icon in its place.
   */
  person: { name: string; photo?: Photo };
}

/**
 * The main moments in consciousness science, oldest first (the row reads
 * left to right, newest on the right): the problem as philosophers posed it,
 * the arguments about computation, the leading theories, ways to detect and
 * measure consciousness, the quantum thread (Orch OR, the decoherence
 * objection, a recent microtubule result) and the first head-to-head test of
 * two leading theories. Not everything, just the turns the field still talks
 * about. People appear as authors of the work cited, not as endorsers of
 * this call. Photos: Wikimedia Commons, credited on the page and in
 * public/consciousness/CREDITS.md; authors with no freely licensed photo show
 * the moment's icon instead.
 */
export const TIMELINE: Moment[] = [
  {
    year: '1974',
    kind: 'problem',
    text: 'An organism is conscious if there is something it is like to be it: a point of view that physical theories seem to leave out.',
    cite: 'Nagel, Philosophical Review',
    sources: [32],
    person: {
      name: 'Thomas Nagel',
      photo: {
        src: '/consciousness/people/nagel.jpg',
        author: 'Jmd442',
        licence: 'CC BY-SA 3.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Thomas_Nagel_teaching_Ethics.JPG',
      },
    },
  },
  {
    year: '1980',
    kind: 'argument',
    text: 'The Chinese room: running the right program, Searle argues, is not by itself enough for understanding.',
    cite: 'Searle, Behavioral and Brain Sciences',
    sources: [33],
    person: {
      name: 'John Searle',
      photo: {
        src: '/consciousness/people/searle.jpg',
        author: 'Matthew Breindel',
        licence: 'CC BY-SA 3.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:John_searle2_(cropped).jpg',
      },
    },
  },
  {
    year: '1988',
    kind: 'theory',
    text: 'Global workspace theory: we become conscious of information when it is broadcast widely to the brain’s many specialised, unconscious processes.',
    cite: 'Baars, Cambridge University Press',
    sources: [34],
    person: { name: 'Bernard Baars' },
  },
  {
    year: '1989',
    kind: 'argument',
    text: 'Penrose argues from Gödel’s theorem that human understanding is not computable, and looks to a future theory of quantum gravity. Logicians widely dispute the argument.',
    cite: 'Penrose, Oxford University Press',
    sources: [35, 21, 22],
    person: {
      name: 'Roger Penrose',
      photo: {
        src: '/consciousness/people/penrose.jpg',
        author: 'Andrej Bauer',
        licence: 'CC BY-SA 2.5 SI',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.5/si/deed.en',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Roger_Penrose_June_2007.jpg',
      },
    },
  },
  {
    year: '1990',
    kind: 'approach',
    text: 'Consciousness can be studied by experiment, starting with what we see. The paper helped launch the search for its neural correlates.',
    cite: 'Crick and Koch, Seminars in the Neurosciences',
    sources: [27],
    person: {
      name: 'Francis Crick',
      photo: {
        src: '/consciousness/people/crick.jpg',
        author: 'Marc Lieberman',
        licence: 'CC BY 2.5',
        licenceUrl: 'https://creativecommons.org/licenses/by/2.5',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Francis_Crick.png',
      },
    },
  },
  {
    year: '1995',
    kind: 'problem',
    text: 'Explaining what the brain does is the “easy” part. The hard problem, named in print: why any of it feels like something.',
    cite: 'Chalmers, J. Consciousness Studies',
    sources: [28],
    person: {
      name: 'David Chalmers',
      photo: {
        src: '/consciousness/people/chalmers.jpg',
        author: 'David Orban',
        licence: 'CC BY 2.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:David_Chalmers_.jpg',
      },
    },
  },
  {
    year: '1996',
    kind: 'theory',
    text: 'Orch OR is proposed: moments of experience as gravity-related quantum state reductions in the microtubules of neurons.',
    cite: 'Hameroff and Penrose, Math. Comput. Simul.',
    sources: [29],
    person: {
      name: 'Roger Penrose',
      photo: {
        src: '/consciousness/people/penrose.jpg',
        author: 'Andrej Bauer',
        licence: 'CC BY-SA 2.5 SI',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.5/si/deed.en',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Roger_Penrose_June_2007.jpg',
      },
    },
  },
  {
    year: '2000',
    kind: 'objection',
    text: 'Quantum states in the brain should decohere within about 10⁻¹³ s, far too fast to matter. Orch OR’s authors dispute the model.',
    cite: 'Tegmark, Phys. Rev. E',
    sources: [2, 3],
    person: {
      name: 'Max Tegmark',
      photo: {
        src: '/consciousness/people/tegmark.jpg',
        author: 'Web Summit',
        licence: 'CC BY 2.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Max_Tegmark_2024_(cropped).jpg',
      },
    },
  },
  {
    year: '2001',
    kind: 'theory',
    text: 'The global neuronal workspace: information becomes conscious when it is amplified into a sudden, brain-scale state that makes it widely available.',
    cite: 'Dehaene and Naccache, Cognition',
    sources: [36],
    person: {
      name: 'Stanislas Dehaene',
      photo: {
        src: '/consciousness/people/dehaene.jpg',
        author: 'Per Henning/NTNU',
        licence: 'CC BY 2.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/2.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Stanislas_Dehaene_2014.jpg',
      },
    },
  },
  {
    year: '2004',
    kind: 'theory',
    text: 'Integrated information theory: consciousness corresponds to a system’s capacity to integrate information, measured as Φ.',
    cite: 'Tononi, BMC Neuroscience',
    sources: [37],
    person: {
      name: 'Giulio Tononi',
      photo: {
        src: '/consciousness/people/tononi.jpg',
        author: 'NIH',
        licence: 'Public domain (US government work)',
        licenceUrl: 'https://commons.wikimedia.org/wiki/Template:PD-USGov',
        sourceUrl:
          'https://commons.wikimedia.org/wiki/File:Giulio_Tononi_at_NIH_PioneerAwardg_2005.jpg',
      },
    },
  },
  {
    year: '2006',
    kind: 'finding',
    text: 'A patient diagnosed as vegetative, asked to imagine playing tennis, activated the same brain areas as healthy volunteers.',
    cite: 'Owen et al., Science',
    sources: [38],
    person: {
      name: 'Adrian Owen',
      photo: {
        src: '/consciousness/people/owen.jpg',
        author: 'Simon Strangeways',
        licence: 'Public domain',
        licenceUrl: 'https://commons.wikimedia.org/wiki/Template:PD-author',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Adrianowen.jpg',
      },
    },
  },
  {
    year: '2013',
    kind: 'approach',
    text: 'Stimulate the cortex with a magnetic pulse and measure how complex the brain’s response is: a gauge of consciousness that needs no report.',
    cite: 'Casali, …, Massimini, Sci. Transl. Med.',
    sources: [39],
    person: {
      name: 'Steven Laureys',
      photo: {
        src: '/consciousness/people/laureys.jpg',
        author: 'MatiasLaureys',
        licence: 'CC BY-SA 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dr._Steven_Laureys_(2022).jpg',
      },
    },
  },
  {
    year: '2023',
    kind: 'approach',
    text: 'Nineteen researchers turn leading theories into indicators to check AI against. Their analysis suggests no current system is conscious, and finds no obvious barrier to building one that meets them.',
    cite: 'Butlin, Long et al., arXiv',
    sources: [25],
    person: {
      name: 'Yoshua Bengio',
      photo: {
        src: '/consciousness/people/bengio.jpg',
        author: 'Maryse Boyce',
        licence: 'CC BY 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yoshua_Bengio_2019_cropped.jpg',
      },
    },
  },
  {
    year: '2024',
    kind: 'evidence',
    text: 'Rats given a microtubule-stabilising drug took about a minute longer to go under with an anesthetic. A small study, not yet replicated.',
    cite: 'Khan, Wiest et al., eNeuro',
    sources: [11],
    person: { name: 'Sana Khan' },
  },
  {
    year: '2025',
    kind: 'test',
    text: 'Integrated information and global workspace theory, tested head to head: results challenge key predictions of both. First shown in 2023, when Koch lost a 25-year bet to Chalmers.',
    cite: 'Cogitate Consortium (Mudrik, Melloni et al.), Nature',
    sources: [30, 31],
    person: {
      name: 'Liad Mudrik',
      photo: {
        src: '/consciousness/people/mudrik.jpg',
        author: 'Shani Shalgi',
        licence: 'CC BY-SA 3.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Liad_Mudrik.jpg',
      },
    },
  },
];

export interface Question {
  id: string;
  scene: QuestionSceneId;
  /** Short name, for the empty proposal slots. */
  name: string;
  question: string;
  known: string;
  countsFor: string;
  countsAgainst: string;
  figure: { caption: string; legend: { label: string; tone: 'a' | 'b' | 'w' | 'f' }[] };
  sources: number[];
}

/** Six open questions, each with a figure, then a text-only invitation to anything else. */
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
    id: 'computation',
    scene: 'turing',
    name: 'Machine consciousness',
    question: 'Could an AI be conscious by computing alone?',
    known:
      'Today’s AI computes. On some leading theories, a computer running the right processes would be conscious; on others, no conventional computer would be, whatever it ran. Penrose argues from Gödel’s theorem that computing alone cannot give understanding, an argument logicians widely dispute. Either answer would change how AI is built, and how we treat what we build.',
    countsFor:
      'Experience tracks only the computation a brain performs: change the physics, keep the computation, and nothing changes.',
    countsAgainst:
      'Experience depends on physical properties a computation leaves out, such as the quantum states in Q3–Q5.',
    figure: {
      caption:
        'A Turing machine writing one symbol per step; each symbol is the size of one dot, so row by row the steps compute a picture of a sunset. Whether a machine running them could ever see it is the question. Schematic.',
      legend: [
        { label: 'Symbols on the tape', tone: 'w' },
        { label: 'Read/write head', tone: 'b' },
        { label: 'The picture it computes', tone: 'a' },
      ],
    },
    sources: [21, 22, 23, 24, 25],
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

/**
 * What the workspace shows beside the chat when someone applies from this
 * page: the parts a proposal needs, and a starter message with blanks.
 */
export const PROPOSAL_GUIDE: RfpGuide = {
  summary:
    'Test how consciousness arises, quantum or not. Say up front which result would count against your view.',
  include: [
    { title: 'Your question', text: 'One of the six on the page, or your own.' },
    { title: 'What would change your mind', text: 'The result for, and the result against.' },
    { title: 'How you test it', text: 'Pre-registered; rerun single-lab claims first.' },
    { title: 'Who runs it', text: 'Your team, ideally with a sceptic on it.' },
    { title: 'Budget and timeline', text: '$50k–$250k, up to 10% overhead.' },
  ],
  length: 'about 2 pages',
  starter: [
    'I’m applying to the call on how consciousness arises.',
    'The question: [one of the six questions on the page, or your own]',
    'What would count against my view: [the result that would change your mind, decided before the data]',
  ].join('\n\n'),
  pageHref: '/consciousness',
};

export interface Faq {
  q: string;
  a: string;
}

export const FAQ: Faq[] = [
  {
    q: 'What makes a strong proposal?',
    a: 'It says, before the data, what result would count against its own view. It is pre-registered, reruns a single-lab claim before building on it, shares data and code, and is sized to the question. A collaborator who expects the opposite outcome makes it stronger.',
  },
  {
    q: 'Is this only for work on Orch OR?',
    a: 'No. Orch OR is where the questions start, but any rigorous work on how consciousness arises is in scope, quantum or not. Critics are funded on the same terms as supporters, and a well-run null result is a result.',
  },
  {
    q: 'Is theory-only work in scope?',
    a: 'Yes, when it makes a claim testable or tests one: a calculation of E_G for tubulin, a decoherence model both sides accept, a formal analysis of the Gödel argument, or a way to tell theories’ predictions apart.',
  },
  {
    q: 'Who can apply?',
    a: 'Anyone with a rigorous plan: university labs, institutes, independent researchers and companies, in any country and at any career stage. Teams that include people who expect different outcomes are welcome.',
  },
  {
    q: 'How large are awards, and is overhead allowed?',
    a: 'Awards range from $50k to $250k, sized to the experiment. Indirect costs of up to 10% are allowed.',
  },
  {
    q: 'How are decisions made?',
    a: 'Proposals are published on ResearchHub and peer reviewed in the open. The ResearchHub Foundation picks which to fund, guided by those reviews.',
  },
  {
    q: 'What about IP and publishing?',
    a: 'Researchers keep their IP. Funded work is published openly on ResearchHub, with its data and code, whatever the result.',
  },
  {
    q: 'Where does my money go?',
    a: 'Only to proposals funded under this call: the experiments and theory that test these questions. Everyone who gives builds the call’s budget together.',
  },
];
