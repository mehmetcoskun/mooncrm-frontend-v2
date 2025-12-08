import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Statistics } from '@/features/statistics';

const StatisticsWithAuth = withPermissionRequired(
  withOrganizationRequired(Statistics),
  { permission: 'statistic_Access' }
);

export const Route = createFileRoute('/_authenticated/statistics/')({
  component: StatisticsWithAuth,
});
