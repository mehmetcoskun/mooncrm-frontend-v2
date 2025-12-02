import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Hotels } from '@/features/hotels';

export const Route = createFileRoute('/_authenticated/hotels/')({
  component: withOrganizationRequired(Hotels),
});
