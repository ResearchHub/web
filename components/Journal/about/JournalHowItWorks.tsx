import React, { FC } from 'react';
import { HowItWorksCard } from './HowItWorksCard';

// Define data locally
const howItWorksItems = [
  {
    id: 'aims',
    title: 'Aims and scope',
    content: (
      <>
        <p>
          ResearchHub Journal welcomes submissions across all scientific disciplines, with a
          particular focus on:
        </p>
        <ul className="list-disc pl-6 my-2 space-y-1">
          <li>Biological and Biomedical Sciences</li>
          <li>Biochemistry, Genetics and Molecular Biology</li>
          <li>Immunology and Microbiology</li>
          <li>Neuroscience</li>
          <li>Pharmacology, Toxicology and Pharmaceutics</li>
          <li>Reproducible research with open data and code</li>
        </ul>
        <p>
          Our mission is to accelerate scientific discovery through open science practices and
          innovative peer review.
        </p>
      </>
    ),
  },
  {
    id: 'publication-types',
    title: 'Article types',
    content: (
      <>
        <p>We accept the following types of submissions:</p>
        <p className="font-medium mt-3 mb-1">Original Research Articles</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Full research papers presenting novel findings</li>
          <li>Complete methodology and results required</li>
          <li>No length restrictions, but clarity and conciseness valued</li>
        </ul>
        <p className="font-medium mt-3 mb-1">Short Communications</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Brief reports of significant findings</li>
          <li>Maximum 3,000 words</li>
          <li>Ideal for time-sensitive or preliminary results</li>
        </ul>
        <p className="font-medium mt-3 mb-1">Case Studies</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Detailed examination of specific real-world contexts</li>
          <li>Must include clear implications and lessons learned</li>
          <li>Structured methodology and analysis required</li>
        </ul>
        <p className="font-medium mt-3 mb-1">Review Articles (Invitation Only)</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Comprehensive analysis of existing literature</li>
          <li>Must provide novel synthesis or perspective</li>
          <li>By invitation only - contact Editorial Board if interested</li>
          <li>Systematic reviews particularly welcomed</li>
        </ul>
      </>
    ),
  },
  {
    id: 'timeline',
    title: 'Timeline',
    content: (
      <>
        <p>Our streamlined review process follows this timeline following submission:</p>
        <ul className="list-disc pl-6 my-2 space-y-1">
          <li>Immediate: Preprint available</li>
          <li>14 days: Peer review completion</li>
          <li>21 days: Publication decision</li>
        </ul>
        <p>
          We maintain these timelines through our innovative peer review incentive structure and
          dedicated editorial team.
        </p>
      </>
    ),
  },
  {
    id: 'author-guidelines',
    title: 'Author guidelines',
    content: (
      <>
        <p>Authors should ensure:</p>
        <ul className="list-disc pl-6 my-2 space-y-1">
          <li>Clear and concise writing</li>
          <li>Complete methodology description</li>
          <li>Open data and code availability</li>
          <li>Proper citation of prior work</li>
          <li>Adherence to reporting standards</li>
        </ul>
        <p>
          For specific guidelines, please consult our author guidelines document, which also
          contains a submission template. Contact the editorial team if you have any questions.
        </p>
        <div className="mt-4">
          <a
            href="https://docs.google.com/document/d/1a3WrTSDOCvWXxWetbPn-TDav56Y7EFwpyzK5B8Ll3Io/edit?tab=t.0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
          >
            View Author Guidelines
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
        </div>
      </>
    ),
  },
  {
    id: 'guidelines',
    title: 'Review guidelines',
    content: (
      <>
        <p>Reviewers are expected to:</p>
        <ul className="list-disc pl-6 my-2 space-y-1">
          <li>Evaluate scientific merit and methodology</li>
          <li>Assess reproducibility of methods and results</li>
          <li>Provide constructive feedback for improvement</li>
          <li>Declare any potential conflicts of interest</li>
          <li>
            Complete reviews using our{' '}
            <a
              href="https://drive.google.com/file/d/1t7NpL39ghnBY9ImWjuunbc6gzmzrhqUt/view?ref=blog.researchhub.foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              structured review template
            </a>
          </li>
        </ul>
        <p>
          Reviews should be thorough, constructive, and actionable. Please contact a member of the
          editorial team if you believe your peer reviews did not meet these standards.
        </p>
      </>
    ),
  },
  {
    id: 'reviewers',
    title: 'Peer reviewers',
    content: (
      <>
        <p>Our peer reviewers are:</p>
        <ul className="list-disc pl-6 my-2 space-y-1">
          <li>Researchers with strong publication history and relevant expertise</li>
          <li>Compensated $150 per high-quality peer review</li>
          <li>Required to complete reviews within 14 days</li>
          <li>
            Provide constructive and actionable feedback using our{' '}
            <a
              href="https://drive.google.com/file/d/1t7NpL39ghnBY9ImWjuunbc6gzmzrhqUt/view?ref=blog.researchhub.foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              structured review template
            </a>
          </li>
        </ul>
        <p>
          We strive to maintain a diverse pool of qualified reviewers across disciplines to ensure
          thorough and timely evaluation of submissions. We choose to pay peer reviewers to share
          their reviews openly because:
        </p>
        <ul className="list-disc pl-6 my-2 space-y-1">
          <li>Peer review is valuable intellectual work</li>
          <li>Financial incentives ensure timely reviews</li>
          <li>Open peer reviews promote higher quality, constructive feedback</li>
        </ul>
        <p>
          This model helps maintain our rapid review timeline while ensuring high-quality peer
          review.
        </p>

        <div className="mt-4">
          <a
            href="https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
          >
            Apply to be a peer reviewer
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
        </div>
      </>
    ),
  },
  {
    id: 'apc',
    title: 'Article processing charge',
    content: (
      <>
        <p>
          Our pricing structure is designed to support quality peer review while maintaining
          accessibility:
        </p>

        <p className="font-medium mt-3 mb-1">Preprint Submission - Free</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Immediate preprint availability</li>
          <li>DOI assignment</li>
          <li>Community engagement (upvotes, comments, tips)</li>
          <li>ResearchCoin rewards eligibility</li>
        </ul>

        <p className="font-medium mt-3 mb-1">Peer-Reviewed Publication - $1,000</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>All preprint benefits included</li>
          <li>2+ expert open peer reviews within 14 days</li>
          <li>21 days to publication decision</li>
          <li>Immediate publication in the ResearchHub journal upon acceptance</li>
        </ul>

        <p className="mt-2">
          The APC supports our innovative peer review system. We compensate expert reviewers for
          their valuable contributions especially in the open. Authors receive comprehensive
          feedback to improve their work regardless of the final editorial decision, enhancing the
          quality and visibility of their research.
        </p>
      </>
    ),
  },
  {
    id: 'dois',
    title: "DOI's for preprints, papers, and peer reviews",
    content: (
      <>
        <p>
          We leverage{' '}
          <a
            href="https://www.crossref.org/services/content-registration/#:~:text=When%20you%20join%20Crossref%20as,via%20machine%20or%20human%20interfaces."
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 hover:underline"
          >
            CrossRef
          </a>{' '}
          to provide DOIs for:
        </p>
        <ul className="list-disc pl-6 my-2 space-y-1">
          <li>Preprints upon submission</li>
          <li>Peer reviews</li>
          <li>Published papers upon acceptance</li>
        </ul>
        <p>
          This ensures all research outputs are citable and properly credited, promoting
          transparency in the scientific process.
        </p>
      </>
    ),
  },
  {
    id: 'licenses',
    title: 'Open access policies',
    content: (
      <>
        <p>All content is published under open licenses:</p>
        <ul className="list-disc pl-6 my-2 space-y-1">
          <li>Manuscripts: CC-BY 4.0</li>
        </ul>
        <p>
          Additionally, we highly recommend leveraging existing repositories such as Zenodo to
          provide open access to data and GitHub to provide open source software access alongside
          your publication.
        </p>
        <ul className="list-disc pl-6 my-2 space-y-1">
          <li>Data: CC0 or CC-BY</li>
          <li>Code: MIT, Apache, or similar open source license</li>
        </ul>
        <p>
          This ensures maximum reusability and increases the likelihood of your work replicating in
          the future, while maintaining proper attribution.
        </p>
      </>
    ),
  },
];

interface HowItWorksItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface JournalHowItWorksProps {
  openItemId: string | null;
  onToggleItem: (id: string) => void;
}

export const JournalHowItWorks: FC<JournalHowItWorksProps> = ({ openItemId, onToggleItem }) => {
  return (
    <div id="how-it-works" className="py-16 px-4 bg-white border-t border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium text-gray-900 mb-4 text-left">How it Works</h2>
          <p className="text-lg text-gray-600 text-left">
            Learn about our publication process, peer review system, and how we accelerate
            scientific discovery through open access and fair compensation.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {howItWorksItems.map((item) => (
            <HowItWorksCard
              key={item.id}
              title={item.title}
              content={item.content}
              isOpen={openItemId === item.id}
              onToggle={() => onToggleItem(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
