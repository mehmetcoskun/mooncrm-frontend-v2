import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Transfers } from '@/features/transfers';

const TransfersWithAuth = withPermissionRequired(
  withOrganizationRequired(Transfers),
  { permission: 'transfer_Access' }
);

export const Route = createFileRoute('/_authenticated/transfers/')({
  component: TransfersWithAuth,
});
