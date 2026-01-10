'use client';

import { ReactNode } from 'react';
import { Session } from 'next-auth';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import ToasterProvider from '@/components/providers/ToasterProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext';
import { CurrencyPreferenceProvider } from '@/contexts/CurrencyPreferenceContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
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
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { ReferralProvider } from '@/contexts/ReferralContext';
import { FeatureNotifications } from '@/components/FeatureNotifications';
import { UserListsProvider } from '@/components/UserList/lib/UserListsContext';
import { LeaderboardProvider } from '@/contexts/LeaderboardContext';
import { DismissedFeaturesProvider } from '@/contexts/DismissedFeaturesContext';

interface ClientProvidersProps {
  children: ReactNode;
  session: Session | null;
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
                        <VerificationProvider>
                          <ExchangeRateProvider>
                            <CurrencyPreferenceProvider>
                              <NotificationProvider>
                                <OrganizationProvider>
                                  <PreferencesProvider>
                                    <UserListsProvider>
                                      <LeaderboardProvider>
                                        <DismissedFeaturesProvider>
                                          <FollowProvider>{children}</FollowProvider>
                                          <FeatureNotifications />
                                        </DismissedFeaturesProvider>
                                      </LeaderboardProvider>
                                    </UserListsProvider>
                                  </PreferencesProvider>
                                </OrganizationProvider>
                              </NotificationProvider>
                            </CurrencyPreferenceProvider>
                          </ExchangeRateProvider>
                        </VerificationProvider>
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
