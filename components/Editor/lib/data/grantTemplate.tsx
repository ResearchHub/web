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
    marks?: Array<{ type: string; [key: string]: any }>;
    content?: DocumentContent[];
  }>;
}

interface Template {
  type: 'doc';
  content: DocumentContent[];
}

const grantTemplate: Template = {
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
          text: '[Topic/Theme]',
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
          text: 'About this funding',
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
          text: "Briefly introduce your organization and explain why you are issuing this RFP now, including the overarching problem or topic you\'re targeting.",
          marks: [{ type: 'italic' }],
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
          text: '[Insert background and rationale here]',
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
          text: 'Topics of interest',
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
          text: 'State your overall goal briefly, then list a few high‐level "areas of interest" that applicants may address. These should be broad, non‐exhaustive topics.',
          marks: [{ type: 'italic' }],
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
          text: 'Overall goal:',
          marks: [{ type: 'bold' }],
        },
        {
          type: 'text',
          text: ' [Insert one‐sentence goal]',
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
          text: 'Specific areas of interest (not exhaustive):',
          marks: [{ type: 'bold' }],
        },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: {
                class: null,
                textAlign: 'left',
              },
              content: [
                {
                  type: 'text',
                  text: '[Area of interest 1]',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: {
                class: null,
                textAlign: 'left',
              },
              content: [
                {
                  type: 'text',
                  text: '[Area of interest 2]',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: {
                class: null,
                textAlign: 'left',
              },
              content: [
                {
                  type: 'text',
                  text: '…',
                },
              ],
            },
          ],
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
          text: 'Funding details',
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
          text: 'State the total budget available for this RFP and the award range per project. Indicate whether multiple projects will be funded.',
          marks: [{ type: 'italic' }],
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
          text: 'Total RFP budget:',
          marks: [{ type: 'bold' }],
        },
        {
          type: 'text',
          text: ' [Insert total amount]',
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
          text: 'Individual award range:',
          marks: [{ type: 'bold' }],
        },
        {
          type: 'text',
          text: ' [Insert minimum] – [Insert maximum]',
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
          text: '[Optional: Indicate number of projects expected to be funded]',
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
          text: 'Additional details',
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
          text: 'Optionally include any additional details to guide submissions or generate discussion.',
          marks: [{ type: 'italic' }],
        },
      ],
    },
  ],
};

export type GrantTemplate = typeof grantTemplate;
export default grantTemplate;
