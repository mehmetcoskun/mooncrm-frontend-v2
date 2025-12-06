import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Reports } from '@/features/reports';

const ReportsWithAuth = withPermissionRequired(
  withOrganizationRequired(Reports),
  { permission: 'report_Access' }
);

export const Route = createFileRoute('/_authenticated/reports/')({
  component: ReportsWithAuth,
});
