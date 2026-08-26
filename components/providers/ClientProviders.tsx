'use client';

import { ReactNode } from 'react';
import { Session } from 'next-auth';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import ToasterProvider from '@/components/providers/ToasterProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext';
import { CurrencyPreferenceProvider } from '@/contexts/CurrencyPreferenceContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { FundingPowerProvider } from '@/contexts/FundingPowerContext';
import { UserProvider } from '@/contexts/UserContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { OnchainProvider } from '@/contexts/OnchainContext';
import { FollowProvider } from '@/contexts/FollowContext';
import { ClickProvider } from '@/contexts/ClickContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { AuthSharingWrapper } from '@/components/AuthSharingWrapper';
import { VerificationProvider } from '@/contexts/VerificationContext';
import SignupModalContainer from '@/components/modals/SignupModalContainer';
import { ShareModalProvider } from '@/contexts/ShareContext';
import ApmProvider from '@/components/ApmProvider';
import { ReferralProvider } from '@/contexts/ReferralContext';
import { FeatureNotifications } from '@/components/FeatureNotifications';
import { UserListsProvider } from '@/components/UserList/lib/UserListsContext';
import { LeaderboardProvider } from '@/contexts/LeaderboardContext';
import { DismissedFeaturesProvider } from '@/contexts/DismissedFeaturesContext';
import { PendingCountsProvider } from '@/components/Moderators/PendingCountsContext';
import { AIModeProvider } from '@/components/AIMode/lib/AIModeContext';
import { AIModeRoot } from '@/components/AIMode/AIModeRoot';

interface ClientProvidersProps {
  readonly children: ReactNode;
  readonly session: Session | null;
}

export function ClientProviders({ children, session }: ClientProvidersProps) {
  return (
    <>
      <ApmProvider />
      <ClickProvider>
        <NavigationProvider>
          <OnchainProvider>
            <NextAuthProvider session={session}>
              <ReferralProvider>
                <AuthSharingWrapper>
                  <AuthModalProvider>
                    <ShareModalProvider>
                      <UserProvider>
                        <PendingCountsProvider>
                          <VerificationProvider>
                            <ExchangeRateProvider>
                              <CurrencyPreferenceProvider>
                                {/* Above the layouts because the left sidebar
                                    carries the funding power card and mounts
                                    outside PageLayout on some routes. */}
                                <FundingPowerProvider>
                                  <NotificationProvider>
                                    <OrganizationProvider>
                                      <UserListsProvider>
                                        <LeaderboardProvider>
                                          <DismissedFeaturesProvider>
                                            {/* Wraps children so the top-bar
                                                launcher can reach it, and sits
                                                inside the feed-card providers
                                                the transcript renders with. */}
                                            <AIModeProvider>
                                              <FollowProvider>{children}</FollowProvider>
                                              <AIModeRoot />
                                            </AIModeProvider>
                                            <FeatureNotifications />
                                          </DismissedFeaturesProvider>
                                        </LeaderboardProvider>
                                      </UserListsProvider>
                                    </OrganizationProvider>
                                  </NotificationProvider>
                                </FundingPowerProvider>
                              </CurrencyPreferenceProvider>
                            </ExchangeRateProvider>
                          </VerificationProvider>
                        </PendingCountsProvider>
                      </UserProvider>
                      <SignupModalContainer />
                    </ShareModalProvider>
                  </AuthModalProvider>
                </AuthSharingWrapper>
              </ReferralProvider>
            </NextAuthProvider>
            <ToasterProvider />
          </OnchainProvider>
        </NavigationProvider>
      </ClickProvider>
    </>
  );
}
