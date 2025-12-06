import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Statuses } from '@/features/statuses';

const StatusesWithAuth = withPermissionRequired(
  withOrganizationRequired(Statuses),
  { permission: 'status_Access' }
);

export const Route = createFileRoute('/_authenticated/statuses/')({
  component: StatusesWithAuth,
});
