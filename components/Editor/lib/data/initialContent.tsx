type ContentTemplate = {
  type: 'doc';
  content: any[];
};

const researchTemplate: ContentTemplate = {
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
          text: 'Research Article Title',
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
          text: 'Abstract',
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
          text: 'Summarize your research findings here...',
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
          text: 'Introduction',
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
          text: 'Provide background and context for your research...',
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
          text: 'Methods',
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
          text: 'Describe your research methodology...',
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
          text: 'Results',
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
          text: 'Present your research findings...',
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
          text: 'Discussion',
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
          text: 'Interpret and discuss your findings...',
        },
      ],
    },
  ],
};

const grantTemplate: ContentTemplate = {
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
          text: 'Grant Proposal Title',
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
          text: 'Executive Summary',
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
          text: 'Brief overview of your proposal...',
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
          text: 'Project Description',
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
          text: 'Detailed description of your proposed project...',
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
          text: 'Goals and Objectives',
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
          text: 'List your project goals and objectives...',
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
          text: 'Methodology',
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
          text: 'Describe your approach and methods...',
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
          text: 'Budget',
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
          text: 'Detailed budget breakdown...',
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
          text: 'Timeline',
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
          text: 'Project timeline and milestones...',
        },
      ],
    },
  ],
};

export const getInitialContent = (type: 'research' | 'grant' = 'research'): ContentTemplate => {
  return type === 'research' ? researchTemplate : grantTemplate;
};

export const initialContent = researchTemplate; // Default export for backward compatibility
