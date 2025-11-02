module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce WorkDocumentTracker in work document pages',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingWorkDocumentTracker:
        'Work document pages must include <WorkDocumentTracker work={work} metadata={metadata} tab="..." /> component. Add it after <SearchHistoryTracker> in the Suspense block.',
    },
  },
  create(context) {
    const filename = context.getFilename();

    // Check if this is a work document page
    const isWorkPage = /app\/(paper|post|fund|question|grant)\/\[id\]\/\[slug\]/.test(filename);

    if (!isWorkPage) {
      return {};
    }

    let hasWorkDocumentTracker = false;
    let hasSearchHistoryTracker = false;
    let suspenseNode = null;

    return {
      // Check for WorkDocumentTracker import
      ImportDeclaration(node) {
        if (node.source.value === '@/components/WorkDocumentTracker') {
          hasWorkDocumentTracker = true;
        }
      },

      // Check for SearchHistoryTracker import
      ImportDeclaration(node) {
        if (node.source.value === '@/components/work/SearchHistoryTracker') {
          hasSearchHistoryTracker = true;
        }
      },

      // Find Suspense component
      JSXElement(node) {
        if (node.openingElement.name.name === 'Suspense') {
          suspenseNode = node;

          // Check if WorkDocumentTracker is present in Suspense children with correct props
          const hasTrackerInSuspense = node.children.some(
            (child) =>
              child.type === 'JSXElement' &&
              child.openingElement.name.name === 'WorkDocumentTracker' &&
              child.openingElement.attributes.some(
                (attr) => attr.name && attr.name.name === 'metadata'
              )
          );

          if (hasTrackerInSuspense) {
            hasWorkDocumentTracker = true;
          }
        }
      },

      // Report error at the end of file processing
      'Program:exit'() {
        if (!hasWorkDocumentTracker) {
          context.report({
            node: suspenseNode || context.getSourceCode().ast,
            messageId: 'missingWorkDocumentTracker',
          });
        }
      },
    };
  },
};
