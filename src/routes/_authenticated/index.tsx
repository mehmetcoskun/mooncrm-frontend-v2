import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Dashboard } from '@/features/dashboard';

export const Route = createFileRoute('/_authenticated/')({
  component: withOrganizationRequired(Dashboard),
});
