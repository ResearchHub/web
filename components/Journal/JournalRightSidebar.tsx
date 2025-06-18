'use client';
// Deprecated file - keeping reference for metrics section

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Zap, CheckCircle, Mail, Linkedin } from 'lucide-react';
import { SocialIcon } from '@/components/ui/SocialIcon';

export const JournalRightSidebar: FC = () => {
  // Editorial board data
  const editorialBoard = [
    {
      id: '1',
      name: 'Dr. Maulik Dhandha',
      role: 'Editor in Chief',
      avatar: '/people/maulik.jpeg',
      email: 'maulik.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/maulik-dhandha-1836a5227/',
      googleScholar: 'https://scholar.google.com/citations?user=M2JZCWMAAAAJ&hl=en',
    },
    {
      id: '2',
      name: 'Dr. Emilio Merheb',
      role: 'Associate Editor',
      avatar: '/people/emilio.jpeg',
      email: 'emilio.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/emilio-merheb-ph-d-29ba10154/',
      googleScholar: 'https://scholar.google.com/citations?user=MY7E-6QAAAAJ&hl=en',
    },
    {
      id: '3',
      name: 'Dr. Attila Karsi',
      role: 'Associate Editor',
      avatar: '/people/attila.jpeg',
      email: 'attila.editor@researchhub.foundation',
      linkedin: 'https://www.linkedin.com/in/attilakarsi/',
      googleScholar: 'https://scholar.google.com/citations?user=kkhhBZgAAAAJ&hl=en',
    },
  ];

  // FAQ items
  const faqItems = [
    {
      question: 'Who can submit to ResearchHub Journal?',
      answer:
        'Any researcher can submit their work to ResearchHub Journal. We welcome submissions from researchers at all career stages and from all institutions.',
    },
    {
      question: 'How long does the review process take?',
      answer:
        'Our peer review process is designed to be efficient. Peer reviews are typically completed within 14 days, and a publication decision is made within 21 days of submission.',
    },
    {
      question: 'Do you compensate peer reviewers?',
      answer:
        'Yes, we value the expertise and time of our peer reviewers. Reviewers receive $150 per review.',
    },
    {
      question: 'Is there a publication fee?',
      answer:
        'No, there are no fees to publish in ResearchHub Journal. We believe in making scientific publishing accessible to all researchers.',
    },
    {
      question: 'How do I become a reviewer?',
      answer:
        "If you're interested in becoming a reviewer, please contact us at review@researchhub.com with your CV and areas of expertise.",
    },
  ];

  // Journal metrics
  const journalMetrics = [
    {
      label: 'Review Completion',
      value: '14 days',
      icon: <Zap className="w-4 h-4 text-primary-500" />,
    },
    {
      label: 'Publication Decision',
      value: '21 days',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    },
    {
      label: 'Acceptance Rate',
      value: '68%',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Editorial Board Section */}
      <div className="bg-white rounded-lg p-4 pl-0">
        <h3 className="font-semibold text-gray-800 mb-4">Editorial Board</h3>
        <div className="space-y-6">
          {editorialBoard.map((editor) => (
            <div key={editor.id} className="space-y-1">
              <div className="flex items-center space-x-3">
                <Avatar src={editor.avatar} size="md" alt={editor.name} />
                <div>
                  <div className="font-medium text-gray-900">{editor.name}</div>
                  <div className="text-sm text-gray-500">{editor.role}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <SocialIcon
                      href={`mailto:${editor.email}`}
                      icon={<Mail className="w-4 h-4" />}
                      label="Email"
                      size="sm"
                    />
                    <SocialIcon
                      href={editor.linkedin}
                      icon={<Linkedin className="w-4 h-4" />}
                      label="LinkedIn"
                      size="sm"
                    />
                    <SocialIcon
                      href={editor.googleScholar}
                      icon={
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
                        </svg>
                      }
                      label="Google Scholar"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center space-x-3 mt-4">
            <Avatar src="/EinsteinAvatar.png" size="md" alt="Join as Editor" />
            <div className="text-sm text-primary-600 hover:text-primary-800 cursor-pointer">
              Interested in joining as an Editor?
            </div>
          </div>
        </div>
      </div>

      {/* Journal Metrics */}
      <div className="bg-white rounded-lg p-4 pl-0">
        <h3 className="font-semibold text-gray-800 mb-4">Journal Metrics</h3>
        <div className="space-y-3">
          {journalMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {metric.icon}
                <span className="text-sm text-gray-600">{metric.label}</span>
              </div>
              <span className="font-medium text-gray-900">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Journal Scope */}
      <div className="bg-white rounded-lg p-4 pl-0">
        <h3 className="font-semibold text-gray-800 mb-4">Scope of the Journal</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            ResearchHub Journal publishes original research in all fields of science, including but
            not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Life Sciences & Biomedicine</li>
            <li>Physical Sciences</li>
            <li>Computer Science & Engineering</li>
            <li>Social Sciences</li>
            <li>Humanities & Arts</li>
          </ul>
          <p className="mt-3">We prioritize research that demonstrates:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Methodological rigor</li>
            <li>Reproducibility</li>
            <li>Transparency</li>
            <li>Novel insights or approaches</li>
          </ul>
          <p className="mt-3">We do not accept work that lacks:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Proper methodology</li>
            <li>Ethical clearance (where applicable)</li>
            <li>Open data (when possible)</li>
            <li>Clear reporting of results</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg p-4 pl-0">
        <h3 className="font-semibold text-gray-800 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {faqItems.map((item, index) => (
            <CollapsibleSection
              key={index}
              title={item.question}
              className="text-sm font-medium text-gray-700"
            >
              <div className="text-sm text-gray-600 pt-2">{item.answer}</div>
            </CollapsibleSection>
          ))}
        </div>
      </div>
    </div>
  );
};
