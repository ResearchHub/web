# USD/RSC Deposit Flow Implementation

This document summarizes all changes implemented to support USD and RSC deposits across the ResearchHub platform.

## Overview

The implementation introduces:
1. New user balance fields for USD/RSC tracking
2. Coinbase-style wallet balance display
3. Collapsible currency selector widget for contributions
4. Inline deposit flows within the contribution modal
5. Back button navigation in deposit modals

---

## Architecture

### Component Hierarchy

```mermaid
flowchart TD
    subgraph WalletPage[Wallet Page]
        UBS[UserBalanceSection]
        UBS --> DOM[DepositOptionsModal]
        DOM --> DRV[DepositRSCView]
        DOM --> WTV[WireTransferView]
        DOM --> BAV[BankAccountView]
    end

    subgraph FundraisePage[Fundraise Page]
        CFM[ContributeToFundraiseModal]
        CFM --> WCS[WalletCurrencySelector]
        CFM --> DOV[DepositOptionsView]
        CFM --> DRV2[DepositRSCView]
        CFM --> WTV2[WireTransferView]
        CFM --> BAV2[BankAccountView]
    end

    subgraph SharedComponents[Shared Funding Components]
        WCS2[WalletCurrencySelector]
        FLI[FeeLineItem]
        IBA[InsufficientBalanceAlert]
        CRG[CurrencyRadioGroup]
        BW[BalanceWidget]
    end
```

### Data Flow

```mermaid
flowchart LR
    API[API Response] --> TU[transformUser]
    TU --> UC[UserContext]
    UC --> UBS[UserBalanceSection]
    UC --> CFM[ContributeToFundraiseModal]
    
    subgraph UserFields[User Balance Fields]
        RSC[rscBalance]
        USD[usdCents]
        TOTAL[totalUsdCents]
        LOCKED[rscLocked]
    end
    
    TU --> UserFields
```

---

## User Type Changes

### New Balance Fields (`types/user.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `rscBalance` | `number` | Available RSC balance |
| `rscLocked` | `number` | Locked RSC (kept in data, hidden from UI) |
| `totalRsc` | `number` | Total balance in RSC equivalent |
| `usdCents` | `number` | Available USD balance in cents |
| `totalUsdCents` | `number` | Total balance in USD cents (the "whole pie") |

**Hard-coded fallback values** (until API is ready):
- `rscBalance`: 5,000 RSC
- `usdCents`: 10,000 ($100.00)
- `totalUsdCents`: 15,000 ($150.00)

---

## Wallet Page Changes

### Before vs After

```
BEFORE:                              AFTER:
┌────────────────────────┐          ┌────────────────────────┐
│ Balance Overview       │          │ $150.00                │
│ $150.00 USD           │          │ Total Balance          │
│ 5,000 RSC             │          ├────────────────────────┤
├────────────────────────┤          │ 💵 USD        $100.00  │
│ Available │ Funding   │          ├────────────────────────┤
│ Balance   │ Credits   │          │ 🔷 RSC         $50.00  │
│ $100      │ $50       │          │              5,000 RSC │
└────────────────────────┘          └────────────────────────┘
```

### Key Changes
- Total balance always shown in USD at top
- USD and RSC shown as separate rows
- RSC row shows USD value (bold) with RSC amount below (gray)
- Removed Funding Credits section
- Removed chevrons and hover effects from balance rows

---

## Contribution Modal Changes

### View State Machine

```mermaid
stateDiagram-v2
    [*] --> Contribute
    Contribute --> DepositOptions: Click "Add funds"
    DepositOptions --> DepositRSC: Select RSC
    DepositOptions --> DepositBank: Select Bank
    DepositOptions --> DepositWire: Select Wire
    DepositRSC --> DepositOptions: Back
    DepositBank --> DepositOptions: Back
    DepositWire --> DepositOptions: Back
    DepositOptions --> Contribute: Back
    Contribute --> [*]: Submit
```

### Currency Selector Widget

```
COLLAPSED:
┌─────────────────────────────────────────┐
│ Fund with                    [🔷 RSC ▼] │
└─────────────────────────────────────────┘

EXPANDED:
┌─────────────────────────────────────────┐
│ Fund with                    [🔷 RSC ▲] │
│                                         │
│ Total Balance                           │
│ $150.00                                 │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔷 RSC    9% fee      5,000 avail ✓│ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 💵 USD    12% fee     $100 avail   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│   ➕ Add funds                        │ │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
└─────────────────────────────────────────┘
```

### Fee Display

```
Amount: [________100________] RSC

Platform fee (9%)                  +9 RSC
─────────────────────────────────────────
Total                             109 RSC
```

---

## Deposit Options Modal Changes

### Navigation Flow

```mermaid
flowchart TD
    A[Add Funds Modal] --> B{Select Option}
    B -->|ResearchCoin| C[Deposit RSC View]
    B -->|Bank Account| D[Bank Account View]
    B -->|Wire Transfer| E[Wire Transfer View]
    
    C -->|Back| A
    D -->|Back| A
    E -->|Back| A
    
    C -->|Success| F[Close & Refresh]
```

### Key Changes
- Uses inline views instead of separate modals
- Back button in header for navigation
- Consistent experience in both wallet and fundraise contexts

---

## New Components Created

### `/components/Funding/`

| Component | Purpose |
|-----------|---------|
| `WalletCurrencySelector` | Collapsible currency picker with balances |
| `CurrencyRadioGroup` | Radio-style currency selection (legacy) |
| `BalanceWidget` | Compact balance display |
| `FeeLineItem` | Fee and total display with divider |
| `InsufficientBalanceAlert` | Alert with "Add funds" action |

### `/components/modals/`

| Component | Purpose |
|-----------|---------|
| `DepositOptionsView` | Inline deposit options (non-modal) |
| `DepositRSCView` | Inline RSC deposit with wallet connection |
| `WireTransferView` | Inline wire transfer details |
| `BankAccountView` | Inline bank account (Coming Soon) |

---

## API Changes

### FundraiseService

```typescript
// Before
contributeToFundraise(fundraiseId: ID, amount: number): Promise<Fundraise>

// After
contributeToFundraise(
  fundraiseId: ID, 
  amount: number,
  currency: 'usd' | 'rsc' = 'rsc'
): Promise<Fundraise>
```

---

## Files Modified

| File | Changes |
|------|---------|
| `types/user.ts` | Added new balance fields |
| `components/ResearchCoin/UserBalanceSection.tsx` | Coinbase-style layout |
| `components/modals/ContributeToFundraiseModal.tsx` | Full restructure with inline deposit |
| `components/modals/ResearchCoin/DepositOptionsModal.tsx` | View state + back navigation |
| `services/fundraise.service.ts` | Added currency parameter |

## Files Created

| File | Purpose |
|------|---------|
| `components/Funding/WalletCurrencySelector.tsx` | Collapsible currency selector |
| `components/Funding/CurrencyRadioGroup.tsx` | Radio-style selector |
| `components/Funding/BalanceWidget.tsx` | Compact balance display |
| `components/Funding/FeeLineItem.tsx` | Fee + total display |
| `components/Funding/InsufficientBalanceAlert.tsx` | Insufficient funds alert |
| `components/Funding/index.ts` | Barrel export |
| `components/modals/DepositOptionsView.tsx` | Inline deposit options |
| `components/modals/DepositRSCView.tsx` | Inline RSC deposit |
| `components/modals/WireTransferView.tsx` | Inline wire transfer |
| `components/modals/BankAccountView.tsx` | Inline bank account |

---

## UX Flow Summary

```mermaid
flowchart TD
    subgraph UserJourney[User Journey]
        A[User visits Fundraise page] --> B[Clicks Fund this Research]
        B --> C[Modal opens with currency selector]
        C --> D{Has sufficient balance?}
        D -->|Yes| E[Enter amount & contribute]
        D -->|No| F[Click Add funds in widget]
        F --> G[Select deposit method]
        G -->|RSC| H[Connect wallet & deposit]
        G -->|Wire| I[View wire details]
        G -->|Bank| J[Coming Soon]
        H --> K[Deposit success]
        K --> C
        E --> L[Contribution success]
    end
```

---

## Fee Structure

| Currency | Platform Fee |
|----------|-------------|
| RSC | 9% |
| USD | 12% |

The fee badge is displayed next to each currency option in the selector, making the cost difference clear to users.
