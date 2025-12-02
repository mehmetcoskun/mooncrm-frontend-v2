import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Settings } from '@/features/settings';

export const Route = createFileRoute('/_authenticated/settings/')({
  component: withOrganizationRequired(Settings),
});
