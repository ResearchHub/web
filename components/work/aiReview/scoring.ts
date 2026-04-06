import type { CategoryDefinition, ChecklistValue, ScoreBand } from './types';

const valueOrder: Record<ChecklistValue, number> = {
  NO: 0,
  PARTIAL: 1,
  YES: 2,
};

const bandFromValues = (values: ChecklistValue[]): ScoreBand => {
  if (values.length === 0) return 'MEDIUM';
  const min = Math.min(...values.map((v) => valueOrder[v]));
  if (min === 0) return 'LOW';
  if (min === 1) return 'MEDIUM';
  return 'HIGH';
};

export const scoreBandLabel = (band: ScoreBand): string => {
  switch (band) {
    case 'LOW':
      return 'Low';
    case 'MEDIUM':
      return 'Medium';
    case 'HIGH':
      return 'High';
  }
};

export const scoreBandStyles = (
  band: ScoreBand
): { dot: string; text: string; bar: string; bg: string; border: string } => {
  switch (band) {
    case 'LOW':
      return {
        dot: 'bg-red-500',
        text: 'text-red-700',
        bar: 'bg-red-500',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    case 'MEDIUM':
      return {
        dot: 'bg-orange-400',
        text: 'text-orange-800',
        bar: 'bg-orange-400',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
      };
    case 'HIGH':
      return {
        dot: 'bg-emerald-500',
        text: 'text-emerald-800',
        bar: 'bg-emerald-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
      };
  }
};

export const checklistValuesForSubcategory = (
  category: CategoryDefinition,
  subId: string
): ChecklistValue[] => {
  const sub = category.subcategories.find((s) => s.id === subId);
  return sub?.checklist.map((c) => c.aiValue) ?? [];
};

export const subcategoryScore = (category: CategoryDefinition, subId: string): ScoreBand => {
  return bandFromValues(checklistValuesForSubcategory(category, subId));
};

export const categoryScore = (category: CategoryDefinition): ScoreBand => {
  const subScores = category.subcategories.map((s) =>
    bandFromValues(s.checklist.map((c) => c.aiValue))
  );
  return bandFromValues(
    subScores.map((b) => (b === 'LOW' ? 'NO' : b === 'MEDIUM' ? 'PARTIAL' : 'YES'))
  );
};

export const overallSpectrumPercent = (categories: CategoryDefinition[]): number => {
  if (categories.length === 0) return 50;
  const subToValue = (b: ScoreBand): number => (b === 'LOW' ? 0 : b === 'MEDIUM' ? 0.5 : 1);
  const catVals = categories.map((c) => subToValue(categoryScore(c)));
  const avg = catVals.reduce((a, b) => a + b, 0) / catVals.length;
  return Math.round(avg * 100);
};
