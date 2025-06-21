import { Icon } from '@/components/ui/icons';

export const AboutResearchCoin = () => {
  return (
    <div className="py-12">
      <div className="mx-auto">
        <div className="text-left mb-8">
          <h2 className="text-3xl font-medium text-gray-900 mb-6 text-center">ResearchCoin</h2>
          <div className="prose prose-indigo mx-auto text-lg">
            <p className="text-gray-600 leading-relaxed">
              To help bring this nascent community together and incentivize contribution to the
              platform, a newly created ERC20 token, ResearchCoin (RSC), has been created. To
              incentivize users, ResearchHub issues tokens that users can earn and transfer to one
              another by sharing, curating, and discussing topics within the platform. Users can
              also transfer tokens to one another on the platform by creating "bounties" to
              incentivize other users to engage with their post. Rewards for contributions are
              proportionate to how valuable the community perceives the actions to be - as measured
              by upvotes.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              ResearchCoin is also linked to reputation on the platform--with reputation being
              measured as a user's lifetime earnings of ResearchCoin minus erosion due to downvotes.
              Reputation is linked to certain privileges in the app, as well as a mechanism for
              moderation within the community.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Further details about ResearchCoin can also be found on the{' '}
              <a
                href="https://docs.researchhub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
              >
                ResearchHub docs page
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
