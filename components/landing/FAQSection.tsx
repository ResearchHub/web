'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'research' | 'financial' | 'technical';
}

const faqs: FAQItem[] = [
  {
    question:
      'Is ResearchHub a legitimate scientific platform or just another cryptocurrency project?',
    answer:
      "ResearchHub is a legitimate scientific platform that has been operating since 2019, with over 50,000 researchers and $2M+ in funding distributed. We're backed by Coinbase and have partnerships with major research institutions. ResearchCoin (RSC) is simply the utility token that powers our incentive system - the focus remains on advancing scientific research.",
    category: 'general',
  },
  {
    question: 'How does paying $150 for peer review maintain quality standards?',
    answer:
      'Our payment system actually improves review quality by attracting expert reviewers and requiring comprehensive feedback. Reviews are validated by our community, and reviewers build reputation scores. Poor reviews result in reduced future opportunities. Studies show incentivized peer review often produces more thorough and timely reviews than traditional unpaid systems.',
    category: 'research',
  },
  {
    question: 'Will employers and tenure committees recognize work published on ResearchHub?',
    answer:
      "ResearchHub publications are indexed in major databases and count toward academic metrics like h-index. Many institutions already recognize our platform, and we're working toward traditional indexing. Our open peer review model actually provides more transparent evidence of research impact than traditional closed systems.",
    category: 'research',
  },
  {
    question: 'Can ResearchCoin be converted to real currency?',
    answer:
      'Yes, ResearchCoin can be converted to major cryptocurrencies and then to traditional currency through established exchanges. We also offer direct USD conversion options for researchers who prefer not to handle cryptocurrency directly.',
    category: 'financial',
  },
  {
    question: 'Is this system sustainable, or will payments disappear once funding runs out?',
    answer:
      "Our model is designed for long-term sustainability through multiple revenue streams: publication fees, premium features, and transaction fees. As the platform grows, network effects create value that supports continued researcher payments. We're not dependent on venture funding for operational payments.",
    category: 'financial',
  },
  {
    question: 'How do you prevent low-quality submissions just to earn review payments?',
    answer:
      'We use a multi-layered quality control system: editorial screening, reviewer reputation scores, community validation, and penalties for poor submissions. Authors must stake RSC tokens, which are forfeited for frivolous submissions. Our acceptance rates are comparable to traditional journals.',
    category: 'research',
  },
  {
    question: 'What happens to my research data and intellectual property?',
    answer:
      'You retain full ownership of your intellectual property. ResearchHub operates under standard academic publishing agreements. Your data remains secure on decentralized infrastructure, giving you more control than traditional publishers who may restrict access to your own work.',
    category: 'technical',
  },
  {
    question: 'How does this compare to traditional journal publishing?',
    answer:
      'We offer faster publication (days vs months), transparent peer review, lower fees ($300 vs $3000+ APCs), and researcher compensation. You still get DOIs, indexing, and academic recognition, but with better economics and transparency.',
    category: 'research',
  },
  {
    question: 'Is ResearchCoin secure and regulated?',
    answer:
      "ResearchCoin operates on Ethereum, one of the most secure blockchain networks. We comply with relevant regulations and work with legal experts in both crypto and academic publishing. The token has utility value beyond speculation - it's designed for scientific ecosystem participation.",
    category: 'technical',
  },
  {
    question: 'Do I need to understand cryptocurrency to use ResearchHub?',
    answer:
      'No - we handle the technical complexity. You can receive payments in USD, and our interface works like any other academic platform. Understanding crypto basics is helpful but not required. We provide educational resources and support for researchers new to the system.',
    category: 'technical',
  },
  {
    question: 'How do you ensure peer reviewers are qualified experts?',
    answer:
      'Reviewers must verify their credentials and build reputation through quality reviews. We match papers with reviewers based on expertise, citation history, and previous review quality. Our system actually provides better reviewer matching than many traditional journals.',
    category: 'research',
  },
  {
    question: 'What if ResearchHub shuts down - what happens to my published work?',
    answer:
      'Your work is permanently stored on decentralized infrastructure (IPFS) and blockchain, making it more durable than traditional publisher databases. Even if ResearchHub ceased operations, your research would remain accessible. We also maintain partnerships with academic archives for additional preservation.',
    category: 'technical',
  },
];

const categories = {
  general: 'General',
  research: 'Research & Publishing',
  financial: 'Financial',
  technical: 'Technical',
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
            Common questions from researchers about ResearchHub and ResearchCoin
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

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Still have questions? We're here to help.</p>
          <button className="bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
            Contact our team
          </button>
        </div>
      </div>
    </section>
  );
}
