import { createFileRoute } from '@tanstack/react-router';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Users } from '@/features/users';

const UsersWithAuth = withPermissionRequired(Users, {
  permission: 'user_Access',
});

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersWithAuth,
});
