import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { ComingSoon } from '@/components/coming-soon';

const CampaignsWithAuth = withPermissionRequired(
  withOrganizationRequired(ComingSoon),
  {
    anyPermission: [
      'whatsapp_message_status_Access',
      'email_message_status_Access',
    ],
  }
);

export const Route = createFileRoute('/_authenticated/campaigns/')({
  component: CampaignsWithAuth,
});
