import { createFileRoute } from '@tanstack/react-router';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Roles } from '@/features/roles';

const RolesWithAuth = withPermissionRequired(Roles, {
  permission: 'role_Access',
});

export const Route = createFileRoute('/_authenticated/roles/')({
  component: RolesWithAuth,
});
