import { LearnRightSidebar } from '@/components/Learn/LearnRightSidebar'
import { PageLayout } from '../layouts/PageLayout'

export default function LearnPage() {
  return (
    <PageLayout rightSidebar={<LearnRightSidebar />}>
      <main>
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Accelerating Scientific Research</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The scientific record is too important to be hidden behind paywalls and in ivory towers. 
            Science should be open: not only for reading, but also for reusing.
          </p>
        </div>

        {/* What is ResearchHub Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">What is ResearchHub?</h2>
          <div className="space-y-6">
            <p className="text-gray-600">
              ResearchHub's users are rewarded with ResearchCoin (RSC) for publishing, 
              reviewing, criticizing, and collaborating in the open. Once earned, RSC gives 
              users the ability to create bounties, tip other users, and gain voting rights 
              within community decision making.
                  </p>
                  
                  <p className="text-gray-600">
                    ResearchHub and ResearchCoin are maintained and improved through a partnership 
                    between the ResearchHub Foundation and Researchhub Technologies, Inc. - Together, 
                    we are a collection of skeptical, yet optimistic individuals who want to accelerate 
                    the pace of science.
                  </p>
                  
                  <p className="text-gray-600 font-medium">
                    We think the incentives of scientific funding and publishing are broken, and that 
                    blockchain can help.
                  </p>

                  {/* Video Section */}
                  <div className="mt-8">
                    <div className="aspect-video w-full max-w-2xl mx-auto rounded-md overflow-hidden">
                      <iframe 
                        className="w-full h-[400px]"
                        src="https://www.youtube.com/embed/mbIdAODhcXo"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Overview Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Overview of the Legacy Scientific Economy</h2>
                <p className="text-gray-600 mb-4">
                  The modern economic model for scientific research is antiquated. A simplified description is as follows: 
                  Funders distribute capital to scientists who conduct research projects and share the results as scientific 
                  papers published within an academic journal.
                </p>
                
                {/* Incentive Structure Table */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Group</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Incentive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Funder</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Distribute capital to research projects</td>
                        <td className="px-6 py-4 text-sm text-gray-600">To fund high-quality research</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Scientists</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Capital → new knowledge</td>
                        <td className="px-6 py-4 text-sm text-gray-600">To conduct high-quality research</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Journals</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Curate + distribute new knowledge</td>
                        <td className="px-6 py-4 text-sm text-gray-600">To generate revenue</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ResearchCoin Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">What is ResearchCoin?</h2>
                
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-6">
                    ResearchCoin (RSC) is a reward token anyone can earn by sharing, curating, and discussing 
                    academic science within ResearchHub. The number of RSC earned for any given action is 
                    proportional to how valuable the community perceives that action to be. Within ResearchHub, 
                    RSC is used to properly recognize and reward users who help create value within our community, 
                    and in doing so, bring the scientific community together.
                  </p>

                  {/* Token Details Card */}
                  <div className="bg-gray-50 rounded-md p-6 mb-8">
                    {/* ... Token Details content remains the same ... */}
                  </div>

                  {/* Why Include a Token Section */}
                  <div className="mb-8">
                    {/* ... Why Include a Token content remains the same ... */}
                  </div>
                </div>
              </section>
            </main>
    </PageLayout>
  )
} 