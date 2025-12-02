import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Statistics } from '@/features/statistics';

export const Route = createFileRoute('/_authenticated/statistics/')({
  component: withOrganizationRequired(Statistics),
});
