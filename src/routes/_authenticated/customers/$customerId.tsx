import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { CustomersDetail } from '@/features/customers/components/customers-detail';

const CustomersDetailWithAuth = withPermissionRequired(
  withOrganizationRequired(CustomersDetail),
  { permission: 'customer_Access' }
);

export const Route = createFileRoute('/_authenticated/customers/$customerId')({
  component: CustomersDetailWithAuth,
});
