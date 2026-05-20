import { ExternalLink } from 'lucide-react';
import { SidebarHeader } from '@/components/ui/SidebarHeader';

export const EndowmentRightSidebar = () => {
  return (
    <div className="w-full">
      <div className="pb-4">
        <div className="px-6 mb-5 mt-3">
          <SidebarHeader title="About" />
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-900">
              ResearchHub Endowment turns your RSC holdings into a continuous stream of research
              funding.
            </span>{' '}
            By holding RSC on the platform, you automatically earn Funding Credits—a currency that
            can only be used to fund preregistered research proposals. Funding Credits are
            distributed daily, with transparent updates on the My Wallet page. There are no lockup
            periods — you may withdraw your principal any time. Yield rates vary based on platform
            participation.
          </p>
        </div>

        <div className="px-6 mb-4">
          <SidebarHeader title="Resources" />
          <div className="space-y-2 pl-1 ml-1">
            <a
              href="https://docs.researchhub.com/researchhub/product-features/fund/researchhub-endowment"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 -mx-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-medium">Learn how the endowment works</span>
              </div>
              <div className="ml-4">
                <ExternalLink size={14} className="text-gray-400" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
