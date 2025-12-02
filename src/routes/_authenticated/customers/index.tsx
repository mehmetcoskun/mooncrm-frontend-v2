import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Customers } from '@/features/customers';

export const Route = createFileRoute('/_authenticated/customers/')({
  component: withOrganizationRequired(Customers),
});
