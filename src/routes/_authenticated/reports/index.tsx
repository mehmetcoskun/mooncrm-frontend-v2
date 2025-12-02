import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Reports } from '@/features/reports';

export const Route = createFileRoute('/_authenticated/reports/')({
  component: withOrganizationRequired(Reports),
});
