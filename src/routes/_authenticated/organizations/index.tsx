import { createFileRoute } from '@tanstack/react-router';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Organizations } from '@/features/organizations';

const OrganizationsWithAuth = withPermissionRequired(Organizations, {
  permission: 'organization_Access',
});

export const Route = createFileRoute('/_authenticated/organizations/')({
  component: OrganizationsWithAuth,
});
