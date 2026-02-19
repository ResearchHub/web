import { WorkImageSection } from '@/app/notebook/components/PublishingForm/components/WorkImageSection';
import { GrantDescriptionSection } from '@/app/notebook/components/PublishingForm/components/GrantDescriptionSection';
import { GrantOrganizationSection } from '@/app/notebook/components/PublishingForm/components/GrantOrganizationSection';
import { GrantFundingAmountSection } from '@/app/notebook/components/PublishingForm/components/GrantFundingAmountSection';
import { ContactsSection } from '@/app/notebook/components/PublishingForm/components/ContactsSection';
import { TopicsSection } from '@/app/notebook/components/PublishingForm/components/TopicsSection';

export function GrantFormSections() {
  return (
    <>
      <WorkImageSection />
      <GrantDescriptionSection />
      <GrantOrganizationSection />
      <ContactsSection />
      <TopicsSection />
      <GrantFundingAmountSection />
    </>
  );
}
