import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Categories } from '@/features/categories';

const CategoriesWithAuth = withPermissionRequired(
  withOrganizationRequired(Categories),
  { permission: 'category_Access' }
);

export const Route = createFileRoute('/_authenticated/categories/')({
  component: CategoriesWithAuth,
});
