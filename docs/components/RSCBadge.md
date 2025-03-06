# RSCBadge Component

A versatile badge component for displaying RSC (Research Coin) amounts with various styling options.

## Usage

```tsx
import { RSCBadge } from '@/components/ui/RSCBadge';

// Basic usage
<RSCBadge amount={111} />

// Inline variant
<RSCBadge amount={111} variant="inline" />

// With a label
<RSCBadge amount={111} label="awarded" />
```

## Props

| Prop        | Type                                  | Default     | Description                                          |
| ----------- | ------------------------------------- | ----------- | ---------------------------------------------------- |
| `amount`    | `number`                              | (required)  | The RSC amount to display                            |
| `className` | `string`                              | `undefined` | Additional CSS classes to apply to the component     |
| `size`      | `'xs' \| 'sm' \| 'md'`                | `'sm'`      | Size of the badge                                    |
| `variant`   | `'inline' \| 'badge' \| 'contribute'` | `'badge'`   | Visual style variant                                 |
| `showText`  | `boolean`                             | `true`      | Whether to show "RSC" text after the amount          |
| `showIcon`  | `boolean`                             | `true`      | Whether to show the RSC icon                         |
| `inverted`  | `boolean`                             | `false`     | Whether to invert colors between amount and RSC text |
| `label`     | `string`                              | `undefined` | Custom label to show after "RSC" (e.g., "awarded")   |

## Color Scheme

The RSCBadge uses an orange color scheme with:

- Orange background
- Orange amount text
- Gray "RSC" text

## Examples

### Different Sizes

```tsx
<RSCBadge amount={111} size="xs" />
<RSCBadge amount={111} size="sm" />
<RSCBadge amount={111} size="md" />
```

### Different Variants

```tsx
// Standard badge with background
<RSCBadge amount={111} variant="badge" />

// Inline without background
<RSCBadge amount={111} variant="inline" />

// Contribute variant with hover effects
<RSCBadge amount={111} variant="contribute" />
```

### With Labels

```tsx
<RSCBadge amount={111} label="awarded" />
```

### Inverted Colors

```tsx
<RSCBadge amount={111} inverted={true} />
```

### In Context

```tsx
// In a card
<div className="p-4 bg-white rounded-lg shadow-sm border">
  <div className="flex items-center justify-between">
    <span className="font-medium">Bounty Amount</span>
    <RSCBadge amount={111} />
  </div>
</div>

// In a button
<button className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-md text-orange-700">
  <span>Contribute</span>
  <RSCBadge amount={111} variant="inline" showText={false} />
</button>
```
