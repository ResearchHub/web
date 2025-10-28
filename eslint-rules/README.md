# Work Document Tracking ESLint Rule

This custom ESLint rule enforces that all work document pages include the `WorkDocumentTracker` component to ensure consistent analytics tracking.

## What it does

The rule checks that files matching the pattern `app/**/[id]/[slug]/**/page.tsx` (work document pages) include:

1. An import for `WorkDocumentTracker` from `@/components/WorkDocumentTracker`
2. The `<WorkDocumentTracker work={work} metadata={metadata} tab="..." />` component in the Suspense block

## Usage

### Running the rule

```bash
# Lint all work pages
npm run lint:work-pages

# Run type-check (includes our ESLint rule)
npm run type-check

# Lint a specific work page
npx eslint app/paper/[id]/[slug]/page.tsx --rulesdir eslint-rules
```

### Error message

If the rule detects a missing `WorkDocumentTracker`, it will show:

```
error  Work document pages must include <WorkDocumentTracker work={work} metadata={metadata} tab="..." /> component. Add it after <SearchHistoryTracker> in the Suspense block  work-document-tracking
```

## Required pattern

Every work document page should follow this pattern:

```tsx
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';

export default async function WorkPage({ params }: Props) {
  const work = await getWork(resolvedParams.id);
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  return (
    <PageLayout rightSidebar={<WorkRightSidebar work={work} metadata={metadata} />}>
      <Suspense>
        <WorkDocument work={work} metadata={metadata} defaultTab="paper" />
        <SearchHistoryTracker work={work} />
        <WorkDocumentTracker work={work} metadata={metadata} tab="paper" />
      </Suspense>
    </PageLayout>
  );
}
```

## Files affected

The rule applies to all work document pages:

- `app/paper/[id]/[slug]/**/page.tsx`
- `app/post/[id]/[slug]/**/page.tsx`
- `app/fund/[id]/[slug]/**/page.tsx`
- `app/question/[id]/[slug]/**/page.tsx`
- `app/grant/[id]/[slug]/**/page.tsx`

## Configuration

The rule is configured in `.eslintrc.json`:

```json
{
  "overrides": [
    {
      "files": ["app/**/\\[id\\]/\\[slug\\]/**/page.tsx"],
      "rules": {
        "work-document-tracking": "error"
      }
    }
  ]
}
```

## Integration with Development Workflow

The rule is automatically enforced in several ways:

### Pre-commit Hooks

- **lint-staged** runs `npm run type-check` for TypeScript files
- **Pre-commit** hooks will catch missing WorkDocumentTracker before commits

### CI/CD Pipeline

- **Type-check command** includes the ESLint rule
- **Build processes** using `npm run type-check` will fail if trackers are missing

### IDE Integration

- **ESLint extensions** will show errors in real-time
- **TypeScript errors** will include ESLint rule violations
