import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Services } from '@/features/services';

const ServicesWithAuth = withPermissionRequired(
  withOrganizationRequired(Services),
  { permission: 'service_Access' }
);

export const Route = createFileRoute('/_authenticated/services/')({
  component: ServicesWithAuth,
});
