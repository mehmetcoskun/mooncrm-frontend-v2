import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Services } from '@/features/services';

export const Route = createFileRoute('/_authenticated/services/')({
  component: withOrganizationRequired(Services),
});
