import { createFileRoute } from '@tanstack/react-router';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Permissions } from '@/features/permissions';

const PermissionsWithAuth = withPermissionRequired(Permissions, {
  permission: 'permission_Access',
});

export const Route = createFileRoute('/_authenticated/permissions/')({
  component: PermissionsWithAuth,
});
