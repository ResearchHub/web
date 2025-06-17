import { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import Image from 'next/image';

// Custom FAQ Item Component
const FAQItem = ({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left hover:text-gray-900 transition-colors"
      >
        <h3 className="text-xl font-medium text-gray-900">{question}</h3>
        <div className="text-gray-500">
          {isOpen ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
        </div>
      </button>
      {isOpen && <div className="pb-6">{answer}</div>}
    </div>
  );
};

const faqs = [
  {
    question: 'Is content created on ResearchHub open?',
    answer: (
      <div className="prose prose-gray max-w-none space-y-6">
        <p>
          Yes. The scientific record is too important to be hidden behind paywalls. Science should
          be open, not only for reading, but also for reusing.
        </p>
        <p>
          That's why user contributions to ResearchHub are shared under the{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            title="Creative Commons Attribution 4.0 International Public License"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Creative Commons Attribution License
          </a>{' '}
          (CC BY 4.0). This license allows anyone to reuse the content for any purpose, as long as
          attribution is provided. We consider a hyperlink or URL back to the source page on
          ResearchHub sufficient attribution.
        </p>
        <p>
          The CC BY license is the gold standard of open licenses for scholarly content. It is used
          by publishers such as{' '}
          <a href="https://www.plos.org/license" className="text-indigo-600 hover:text-indigo-500">
            PLOS
          </a>
          ,{' '}
          <a
            href="https://elifesciences.org/about/openness"
            className="text-indigo-600 hover:text-indigo-500"
          >
            eLife
          </a>
          ,{' '}
          <a href="https://distill.pub/faq/" className="text-indigo-600 hover:text-indigo-500">
            Distill
          </a>
          , and{' '}
          <a
            href="https://www.biomedcentral.com/getpublished/copyright-and-license"
            className="text-indigo-600 hover:text-indigo-500"
          >
            BMC
          </a>
          . By choosing CC BY, ResearchHub ensures user content can be reused to further science, by
          way of text mining, sharing, translation, and many other forms of reuse. This sets
          ResearchHub apart from other places to discuss science, like ResearchGate or Reddit, which
          do not apply an open license to all user-contributed content.
        </p>
      </div>
    ),
  },
  {
    question: 'What papers can I legally upload to ResearchHub?',
    answer: (
      <div className="prose prose-gray max-w-none space-y-6">
        <p>
          Users can create a ResearchHub page for any paper, allowing for summary and discussion.
          However, due to copyright, only certain papers are eligible for fulltext PDF upload.
          Specifically, please only upload fulltexts of papers released under one of the following
          open licenses:{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            title="Creative Commons Attribution 4.0 International Public License"
            className="text-indigo-600 hover:text-indigo-500"
          >
            CC BY
          </a>{' '}
          or{' '}
          <a
            href="https://creativecommons.org/publicdomain/zero/1.0/"
            title="Creative Commons Universal Public Domain Dedication (CC0 1.0)"
            className="text-indigo-600 hover:text-indigo-500"
          >
            CC0
          </a>
          .
        </p>
        <p>
          To determine whether an article is released under one of these licenses, check for any
          text in the PDF stating a license or refer to the webpage where you downloaded the PDF. If
          you are the author of a paper and would like to upload the fulltext to ResearchHub, apply
          a supported license to the paper at an existing publicly available location. In other
          words, PDFs uploaded to ResearchHub should be available elsewhere on the web with a
          supported license. We do not currently publish original articles that are not available
          elsewhere.
        </p>
        <p>
          Disappointed that you cannot upload a paper's PDF due to copyright? We are too. While open
          access publishing is growing in popularity, many papers are still published in toll access
          journals without open licenses. We can change this by encouraging scientists to publish in
          open access journals and use platforms like ResearchHub that remove legal barriers from
          science.
        </p>
      </div>
    ),
  },
  {
    question: 'Who created this site?',
    answer: (
      <div className="prose prose-gray max-w-none space-y-6">
        <p>
          ResearchHub is being developed by a small team of passionate founders working in San
          Francisco, CA.
        </p>
        <p>
          The idea for the site was initially proposed in this{' '}
          <a
            href="https://medium.com/@barmstrong/ideas-on-how-to-improve-scientific-research-9e2e56474132"
            className="text-indigo-600 hover:text-indigo-500"
          >
            blog post
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    question: 'How can I help?',
    answer: (
      <div className="prose prose-gray max-w-none space-y-6">
        <p>
          The easiest way to help the community grow is to sign in and start contributing content.
        </p>
        <p>
          <strong>1. Sign in</strong>
          <br />
          Create your account in just a few clicks, using Google Sign In.
        </p>
        <p>
          <strong>2. Upload a paper</strong>
          <br />
          Is there a research paper you thought was particularly insightful?
        </p>
        <p>
          <strong>3. Write/edit a summary</strong>
          <br />
          Is there a paper that you can help explain in plain English?
        </p>
        <p>
          <strong>4. Upvote (or downvote) a paper</strong>
          <br />
          Is there a paper already on the site that you have an opinion on?
        </p>
        <p>
          <strong>5. Start a discussion.</strong>
          <br />
          Is there a question you have about a paper?
        </p>
        <p>
          <strong>6. Follow us on Twitter</strong>
          <br />
          Hear our latest updates as we make progress.
        </p>
      </div>
    ),
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
        <div className="relative pb-0 sm:!pb-12">
          <Image
            src="/about/about-2.png"
            alt="FAQ Banner"
            width={1200}
            height={380}
            className="w-full h-[380px] object-contain rounded-lg"
            priority
            objectFit="contain"
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            <h2 className="text-3xl font-medium text-gray-900">Frequently Asked Questions</h2>
          </div>

          <div className="rounded-xl shadow-sm">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openSections.includes(`faq-${index}`)}
                onToggle={() => toggleSection(`faq-${index}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
