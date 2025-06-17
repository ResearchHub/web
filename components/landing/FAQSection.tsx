'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'funding' | 'crypto' | 'research';
}

const faqs: FAQItem[] = [
  {
    question: 'What exactly is ResearchHub and how does it work?',
    answer:
      'ResearchHub is a platform where researchers can publish papers, get peer reviews, and earn rewards - while funders can directly support scientific research they care about. Think of it as a scientific marketplace: researchers submit their work, qualified peers review it for compensation, and funders can sponsor specific research areas or projects. Everything happens transparently with faster timelines than traditional publishing.',
    category: 'general',
  },
  {
    question: 'How do I know my donation will actually support legitimate scientific research?',
    answer:
      'All researchers on ResearchHub must verify their academic credentials and institutional affiliations. Research submissions go through editorial screening and expert peer review. You can see exactly where your funding goes - whether to specific papers, research areas, or peer review incentives. We partner with established academic institutions and maintain the same quality standards as traditional journals.',
    category: 'funding',
  },
  {
    question: 'What are the tax benefits of funding research through ResearchHub?',
    answer:
      'ResearchHub offers both tax-deductible and non-tax-deductible funding options. Tax-deductible donations go through our 501(c)(3) nonprofit partner and qualify for standard charitable deductions. Non-tax-deductible funding goes directly to researchers and may offer more flexibility in how funds are used. We recommend consulting your tax advisor for your specific situation.',
    category: 'funding',
  },
  {
    question: 'Can I fund research in specific diseases or areas I care about?',
    answer:
      'Absolutely. You can create targeted funding calls for specific research areas, diseases, or methodologies. You can also browse existing research and fund papers that align with your interests. Our platform lets you set funding criteria, timelines, and reporting requirements so you can support exactly the science you want to advance.',
    category: 'funding',
  },
  {
    question: 'Do I need to understand cryptocurrency to use ResearchHub?',
    answer:
      'No. While ResearchHub uses ResearchCoin (RSC) internally for incentives, you can participate entirely in traditional currency. Funders can donate in USD, and researchers can receive payments in USD. We handle all the technical complexity behind the scenes. The cryptocurrency aspect is optional and primarily for users who want to engage more deeply with the tokenomics.',
    category: 'crypto',
  },
  {
    question: 'What is ResearchCoin (RSC) and why does it exist?',
    answer:
      'ResearchCoin (RSC) is the utility token that powers incentives on ResearchHub. It allows for programmable rewards - automatically paying reviewers when quality reviews are submitted, rewarding researchers for citations, and enabling community governance. RSC can be converted to major cryptocurrencies and then to traditional currency, but many users never need to interact with it directly.',
    category: 'crypto',
  },
  {
    question: 'Is ResearchCoin regulated and secure?',
    answer:
      'RSC operates on Ethereum, a well-established blockchain network. We comply with applicable regulations and work with legal experts in both cryptocurrency and academic publishing. RSC is designed as a utility token for scientific incentives, not as an investment product. We recommend treating it as a tool for research participation rather than a financial investment.',
    category: 'crypto',
  },
  {
    question: 'Will employers and tenure committees recognize ResearchHub publications?',
    answer:
      "Yes. ResearchHub publications receive DOIs, are indexed in major academic databases, and count toward standard academic metrics like h-index. Many institutions already recognize our platform, and we're working toward inclusion in additional traditional indexing systems. Our open peer review model actually provides more transparent evidence of research quality and impact than traditional closed systems.",
    category: 'research',
  },
  {
    question: 'How do you ensure peer reviewers are actually qualified experts?',
    answer:
      'All reviewers must verify their academic credentials and build reputation through quality reviews. We match papers with reviewers based on expertise, publication history, and previous review quality. Poor reviews result in reduced future opportunities and lower payments. Our system often provides better reviewer matching than traditional journals because we can track reviewer performance over time.',
    category: 'research',
  },
  {
    question: 'How much do researchers earn for peer reviewing?',
    answer:
      'Peer review compensation typically ranges from $50-$200 per review, depending on paper length and complexity. Payment is based on review quality and timeliness. Unlike traditional unpaid peer review, our compensation attracts expert reviewers and incentivizes thorough, constructive feedback. The exact amount is visible before you accept any review assignment.',
    category: 'research',
  },
  {
    question: 'How do you prevent low-quality submissions and reviews?',
    answer:
      'We use multiple quality controls: editorial pre-screening, reviewer reputation systems, community validation, and economic stakes. Authors must meet academic standards, and frivolous submissions result in penalties. Reviewers are scored on their feedback quality, and consistently poor reviewers lose access to paid opportunities. Our acceptance rates are comparable to traditional journals.',
    category: 'research',
  },
  {
    question: 'What happens if ResearchHub shuts down - is my research safe?',
    answer:
      'Your research is stored on decentralized infrastructure (IPFS) and blockchain, making it more durable than traditional publisher databases. Even if ResearchHub ceased operations, your work would remain permanently accessible. We also maintain partnerships with academic archives for additional preservation. Your intellectual property rights remain fully with you.',
    category: 'research',
  },
  {
    question: 'How does this compare to traditional journal publishing?',
    answer:
      'ResearchHub offers faster publication (days vs months), transparent peer review, lower fees ($150-300 vs $3000+ APCs), and researcher compensation. You still get DOIs, indexing, and academic recognition, but with better economics, transparency, and speed. Many researchers use us alongside traditional journals, especially for timely or interdisciplinary work.',
    category: 'research',
  },
  {
    question: 'Is this sustainable long-term, or will payments disappear?',
    answer:
      "Our model is designed for sustainability through multiple revenue streams: publication fees, premium features, and network transaction fees. As the platform grows, network effects create value that supports continued payments. We're not dependent on venture funding for operational rewards - the economic model is self-sustaining as usage increases.",
    category: 'general',
  },
  {
    question: 'How can I track the impact of my funding?',
    answer:
      "You receive detailed reports on how your funding is used, including which papers were reviewed, researcher outcomes, and research progress. You can see citation metrics, follow-up studies, and real-world applications of the research you supported. Our transparent system lets you track impact in ways traditional funding often doesn't allow.",
    category: 'funding',
  },
];

const categories = {
  general: 'General',
  funding: 'For Funders',
  crypto: 'Crypto & RSC',
  research: 'For Researchers',
};

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredFAQs =
    selectedCategory === 'all' ? faqs : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50/50 via-slate-50/20 to-slate-100/40 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#3971FF]/5 to-transparent transform -skew-y-1"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM0E3MVBGIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-16 h-16 bg-[#3971FF]/40 rounded-full animate-pulse-slow blur-sm"></div>
        <div
          className="absolute bottom-20 left-20 w-12 h-12 bg-blue-300/35 rounded-full animate-pulse-slow blur-sm"
          style={{ animationDelay: '1.5s' }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-8 h-8 bg-purple-200/50 rounded-full animate-pulse-slow blur-sm"
          style={{ animationDelay: '2.5s' }}
        ></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'Cal Sans, sans-serif' }}
          >
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-[#3971FF] via-[#4A7FFF] to-[#5B8DFF] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Common questions from researchers, funders, and crypto enthusiasts about ResearchHub
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-gray-100 rounded-xl flex-wrap justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              All
            </button>
            {Object.entries(categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => {
            const isOpen = openItems.includes(index);
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50/50 rounded-xl transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900 pr-4 text-base sm:text-lg">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-5">
                    <div className="border-t border-gray-200/50 pt-4">
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
