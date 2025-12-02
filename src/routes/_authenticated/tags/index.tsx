import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Tags } from '@/features/tags';

export const Route = createFileRoute('/_authenticated/tags/')({
  component: withOrganizationRequired(Tags),
});
