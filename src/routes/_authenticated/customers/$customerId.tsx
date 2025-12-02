import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { CustomerDetail } from '@/features/customers/components/customer-detail';

export const Route = createFileRoute('/_authenticated/customers/$customerId')({
  component: withOrganizationRequired(CustomerDetail),
});
