const TRACKER_MODULE = '@/components/WorkDocumentTracker';
const TRACKER_EXPORT = 'WorkDocumentTracker';
const REQUIRED_PROPS = ['work', 'metadata', 'tab'];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require WorkDocumentTracker on work document pages',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingImport: `Work document pages must import { ${TRACKER_EXPORT} } from '${TRACKER_MODULE}'.`,
      missingUsage: `Work document pages must render <${TRACKER_EXPORT} work={...} metadata={...} tab="..." />.`,
      missingProps: `${TRACKER_EXPORT} is missing required {{props}} {{propLabel}}.`,
    },
  },
  create(context) {
    const trackerLocalNames = new Set();
    const trackerUsages = [];

    return {
      ImportDeclaration(node) {
        if (node.source.value !== TRACKER_MODULE) {
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportSpecifier' && specifier.imported.name === TRACKER_EXPORT) {
            trackerLocalNames.add(specifier.local.name);
          }
        }
      },

      JSXOpeningElement(node) {
        if (node.name.type === 'JSXIdentifier' && trackerLocalNames.has(node.name.name)) {
          trackerUsages.push(node);
        }
      },

      'Program:exit'(node) {
        if (trackerLocalNames.size === 0) {
          context.report({
            node,
            messageId: 'missingImport',
          });
          return;
        }

        if (trackerUsages.length === 0) {
          context.report({
            node,
            messageId: 'missingUsage',
          });
          return;
        }

        for (const usage of trackerUsages) {
          const presentProps = new Set(
            usage.attributes
              .filter((attribute) => attribute.type === 'JSXAttribute')
              .map((attribute) => attribute.name.name)
          );
          const missingProps = REQUIRED_PROPS.filter((prop) => !presentProps.has(prop));

          if (missingProps.length > 0) {
            context.report({
              node: usage,
              messageId: 'missingProps',
              data: {
                props: missingProps.join(', '),
                propLabel: missingProps.length === 1 ? 'prop' : 'props',
              },
            });
          }
        }
      },
    };
  },
};
