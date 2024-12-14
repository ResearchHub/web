export const initialContent = {
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
          type: 'emoji',
          attrs: {
            name: 'microscope',
          },
        },
        {
          type: 'text',
          text: ' Digital Lab Notebook',
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
          text: 'Welcome to your intelligent lab notebook. This modern research environment combines the structure of traditional lab documentation with AI-assisted features and real-time collaboration capabilities.',
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
          text: 'Experiment: PCR Amplification',
        },
      ],
    },
    {
      type: 'codeBlock',
      attrs: {
        language: 'python'
      },
      content: [
        {
          type: 'text',
          text: 'def calculate_pcr_temp(primer_sequence):\n    # Calculate melting temperature\n    gc_content = (primer_sequence.count("G") + primer_sequence.count("C")) / len(primer_sequence)\n    tm = 64.9 + 41 * (gc_content - 0.41)\n    return tm\n\n# Example primer\nprimer = "ATCGGGCTAT"\nprint(f"Annealing temperature: {calculate_pcr_temp(primer)}°C")',
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
          text: 'Protocol steps:',
        },
      ],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: {
            checked: true,
          },
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
                  text: 'Prepare master mix',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: {
            checked: true,
          },
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
                  text: 'Add primers (',
                },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'textStyle',
                      attrs: {
                        color: '#b91c1c',
                      },
                    },
                  ],
                  text: '10µM',
                },
                {
                  type: 'text',
                  text: ' final concentration)',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: {
            checked: false,
          },
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
                  text: 'Run thermal cycler',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'text', text: 'Step' }],
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'text', text: 'Temperature' }],
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'text', text: 'Time' }],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'text', text: 'Initial Denaturation' }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'text', text: '95°C' }],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'text', text: '3 min' }],
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
          text: 'Results',
        },
      ],
    },
    {
      type: 'imageBlock',
      attrs: {
        src: '/placeholder-image.jpg',
        width: '100%',
        align: 'center',
        caption: 'Gel electrophoresis results',
      },
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
          marks: [
            {
              type: 'highlight',
              attrs: {
                color: '#7e7922',
              },
            },
          ],
          text: 'Key observation:',
        },
        {
          type: 'text',
          text: ' Band intensity suggests successful amplification of target sequence.',
        },
      ],
    },
  ],
}
