export interface PipelineStep {
  number: string;
  title: string;
  description: string;
}

export const pipelineSteps: PipelineStep[] = [
  {
    number: '01',
    title: 'Public preregistration',
    description:
      'Researchers publicly register their study design before starting — locking in methods to promote reproducibility.',
  },
  {
    number: '02',
    title: 'Open peer critique',
    description:
      'Qualified domain researchers review preregistered proposals openly, with paid turnaround in under 10 days.',
  },
  {
    number: '03',
    title: 'Capital commitment',
    description:
      'Funders commit capital to proposals that pass review. Low overhead (0–10%) means more dollars to experiments.',
  },
  {
    number: '04',
    title: 'Linked results',
    description:
      'Results are linked back to the original preregistration — a transparent, auditable record of the full research cycle.',
  },
];
