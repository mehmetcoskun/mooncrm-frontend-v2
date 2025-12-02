import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Statuses } from '@/features/statuses';

export const Route = createFileRoute('/_authenticated/statuses/')({
  component: withOrganizationRequired(Statuses),
});
