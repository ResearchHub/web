export const LearnRightSidebar: React.FC = () => {
  return (
    <div className="w-80 fixed right-0 top-0 h-screen border-l overflow-y-auto p-4">
      <div className="sticky top-16 pt-4">
        <h3 className="font-semibold mb-4">Quick Navigation</h3>
        <nav className="space-y-2">
          <a href="#overview" className="block text-sm text-gray-600 hover:text-indigo-600">
            Overview
          </a>
          <a href="#problems" className="block text-sm text-gray-600 hover:text-indigo-600">
            Current Challenges
          </a>
          <a href="#researchcoin" className="block text-sm text-gray-600 hover:text-indigo-600">
            ResearchCoin (RSC)
          </a>
          <div className="pl-4 space-y-2">
            <a href="#token-overview" className="block text-sm text-gray-500 hover:text-indigo-600">
              Token Overview
            </a>
            <a href="#token-purpose" className="block text-sm text-gray-500 hover:text-indigo-600">
              Why Include a Token?
            </a>
          </div>
          <a href="#solution" className="block text-sm text-gray-600 hover:text-indigo-600">
            Our Solution
          </a>
        </nav>
      </div>
    </div>
  );
};
