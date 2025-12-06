import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Customers } from '@/features/customers';

const CustomersWithAuth = withPermissionRequired(
  withOrganizationRequired(Customers),
  { permission: 'customer_Access' }
);

export const Route = createFileRoute('/_authenticated/customers/')({
  component: CustomersWithAuth,
});
