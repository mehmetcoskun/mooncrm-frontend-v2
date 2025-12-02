import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Categories } from '@/features/categories';

export const Route = createFileRoute('/_authenticated/categories/')({
  component: withOrganizationRequired(Categories),
});
