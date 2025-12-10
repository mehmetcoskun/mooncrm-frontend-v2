import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { FacebookLeads } from '@/features/facebook-leads';

const FacebookLeadsWithAuth = withPermissionRequired(
  withOrganizationRequired(FacebookLeads),
  { permission: 'facebook_lead_Access' }
);

export const Route = createFileRoute('/_authenticated/facebook-leads/')({
  component: FacebookLeadsWithAuth,
});
