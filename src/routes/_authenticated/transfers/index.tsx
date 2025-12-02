import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Transfers } from '@/features/transfers';

export const Route = createFileRoute('/_authenticated/transfers/')({
  component: withOrganizationRequired(Transfers),
});
