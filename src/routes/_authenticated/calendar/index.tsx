import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Calendar } from '@/features/calendar';

export const Route = createFileRoute('/_authenticated/calendar/')({
  component: withOrganizationRequired(Calendar),
});
