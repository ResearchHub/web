export interface PipelineStep {
  number: string;
  title: string;
  description: string;
  imageAlt: string;
  imageSrc: string;
}

export const pipelineSteps: PipelineStep[] = [
  {
    number: '01',
    title: 'Public preregistration',
    description:
      'Researchers publicly register their study design before starting — locking in methods to promote reproducibility.',
    imageAlt: 'ResearchHub proposal card before funding',
    imageSrc: '/about/preregistration_before.png',
  },
  {
    number: '02',
    title: 'Open peer review',
    description:
      'Qualified domain researchers review preregistered proposals openly, with paid turnaround in under 10 days.',
    imageAlt: 'ResearchHub peer review card',
    imageSrc: '/about/peer_review.png',
  },
  {
    number: '03',
    title: 'Capital commitment',
    description:
      'Funders commit capital to proposals that pass review. Low overhead (0–10%) means more dollars to experiments.',
    imageAlt: 'ResearchHub proposal funding progress complete',
    imageSrc: '/about/proposal_funded.png',
  },
  {
    number: '04',
    title: 'Linked results',
    description:
      'Results are linked back to the original preregistration — a transparent, auditable record of the full research cycle.',
    imageAlt: 'ResearchHub author project update',
    imageSrc: '/about/proposal_update.png',
  },
];
