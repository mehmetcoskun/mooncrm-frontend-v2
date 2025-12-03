import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { CustomersDetail } from '@/features/customers/components/customers-detail';

export const Route = createFileRoute('/_authenticated/customers/$customerId')({
  component: withOrganizationRequired(CustomersDetail),
});
