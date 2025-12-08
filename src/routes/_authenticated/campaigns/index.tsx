import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Campaigns } from '@/features/campaigns';

const CampaignsWithAuth = withPermissionRequired(
  withOrganizationRequired(Campaigns),
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
