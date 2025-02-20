interface DocumentContent {
  type: string;
  attrs?: {
    textAlign?: string;
    level?: number;
    class?: string | null;
  };
  content?: Array<{
    type: string;
    text?: string;
  }>;
}

interface Template {
  type: 'doc';
  content: DocumentContent[];
}

const preregistrationTemplate: Template = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 1,
      },
      content: [
        {
          type: 'text',
          text: 'Preregistration Template',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: '1. Overview',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        class: null,
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: 'Provide a brief overview of: (1) scientific rationale and importance, (2) confirmation of funding/facilities/ethics approvals, (3) estimated timeline, and (4) data sharing commitment.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: '2. Introduction',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        class: null,
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: "Summarize theoretical background, key literature, research questions, and numbered hypotheses (H1, H2, etc.). Explain the study's importance  with an impact statement, regardless of potential outcomes.",
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: '3. Methods',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'Participants/Sample',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        class: null,
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: 'Define target sample, inclusion/exclusion criteria, recruitment strategy, and sample size justification (including power analysis).',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'Materials and Procedures',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        class: null,
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: 'Describe experimental/observational procedures, stimuli, tasks, equipment, and data collection settings with sufficient detail for replication.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'Planned Analyses',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        class: null,
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: 'Outline analysis pipeline, preprocessing steps, statistical tests, and hypothesis-specific predictions. Include any contingent analysis decisions as IF-THEN statements.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'Ethics and Data Management',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        class: null,
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: 'State ethical approval status or plan, confidentiality measures, and data sharing/archiving plan.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: '4. Pilot Data (Optional)',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        class: null,
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: 'Summarize any pilot data or simulations that demonstrate method feasibility and inform power analysis. Clearly distinguish from main study.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: '5. Budget',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        class: null,
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: 'Provide an itemized list of anticipated costs (materials, personnel, etc.). These are not binding and are able to be adjusted based on the results of the pilot data.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        textAlign: 'left',
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: '6. References',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        class: null,
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: 'List all references used in the manuscript using Nature style (e.g. numbered in-text citations and alphabetical references at the end of the manuscript).',
        },
      ],
    },
  ],
};

export type PreregistrationTemplate = typeof preregistrationTemplate;
export default preregistrationTemplate;
