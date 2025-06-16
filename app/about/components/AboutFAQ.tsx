import { useState } from 'react';
import { CollapsibleSection, CollapsibleItem } from '@/components/ui/CollapsibleSection';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Is content created on ResearchHub open?',
    answer: `Yes. The scientific record is too important to be hidden behind paywalls. Science should be open, not only for reading, but also for reusing.

That's why user contributions to ResearchHub are shared under the Creative Commons Attribution License (CC BY 4.0). This license allows anyone to reuse the content for any purpose, as long as attribution is provided. We consider a hyperlink or URL back to the source page on ResearchHub sufficient attribution.

The CC BY license is the gold standard of open licenses for scholarly content. It is used by publishers such as PLOS, eLife, Distill, and BMC. By choosing CC BY, ResearchHub ensures user content can be reused to further science, by way of text mining, sharing, translation, and many other forms of reuse. This sets ResearchHub apart from other places to discuss science, like ResearchGate or Reddit, which do not apply an open license to all user-contributed content.`,
  },
  {
    question: 'What papers can I legally upload to ResearchHub?',
    answer: `Users can create a ResearchHub page for any paper, allowing for summary and discussion. However, due to copyright, only certain papers are eligible for fulltext PDF upload. Specifically, please only upload fulltexts of papers released under one of the following open licenses: CC BY or CC0.

To determine whether an article is released under one of these licenses, check for any text in the PDF stating a license or refer to the webpage where you downloaded the PDF. If you are the author of a paper and would like to upload the fulltext to ResearchHub, apply a supported license to the paper at an existing publicly available location. In other words, PDFs uploaded to ResearchHub should be available elsewhere on the web with a supported license. We do not currently publish original articles that are not available elsewhere.

Disappointed that you cannot upload a paper's PDF due to copyright? We are too. While open access publishing is growing in popularity, many papers are still published in toll access journals without open licenses. We can change this by encouraging scientists to publish in open access journals and use platforms like ResearchHub that remove legal barriers from science.`,
  },
  {
    question: 'Who created this site?',
    answer: `ResearchHub is being developed by a small team of passionate founders working in San Francisco, CA.

The idea for the site was initially proposed in this blog post.`,
  },
  {
    question: 'How can I help?',
    answer: `The easiest way to help the community grow is to sign in and start contributing content.

1. Sign in
Create your account in just a few clicks, using Google Sign In.

2. Upload a paper
Is there a research paper you thought was particularly insightful?

3. Write/edit a summary
Is there a paper that you can help explain in plain English?

4. Upvote (or downvote) a paper
Is there a paper already on the site that you have an opinion on?

5. Start a discussion.
Is there a question you have about a paper?

6. Follow us on Twitter
Hear our latest updates as we make progress.`,
  },
];

export const AboutFAQ = () => {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-medium text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h2>

        <CollapsibleSection title="Common Questions" icon={<HelpCircle className="w-5 h-5" />}>
          {faqs.map((faq, index) => (
            <CollapsibleItem
              key={index}
              title={faq.question}
              isOpen={openSections.includes(`faq-${index}`)}
              onToggle={() => toggleSection(`faq-${index}`)}
            >
              <div className="prose prose-gray max-w-none">
                {faq.answer.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CollapsibleItem>
          ))}
        </CollapsibleSection>
      </div>
    </div>
  );
};
