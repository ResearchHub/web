import { Mail } from 'lucide-react';
import Image from 'next/image';

export const AboutContact = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          <div>
            <h2 className="text-3xl font-medium text-gray-900 mb-8">Contact Us</h2>
            <div className="flex items-center space-x-4">
              <Mail className="w-6 h-6 text-gray-500" />
              <a
                href="mailto:hello@researchhub.com"
                className="text-lg text-gray-600 hover:text-gray-900"
              >
                hello@researchhub.com
              </a>
            </div>
          </div>
          <div className="relative h-[400px]">
            <Image
              src="/static/about/about-3.png"
              alt="Contact ResearchHub"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
