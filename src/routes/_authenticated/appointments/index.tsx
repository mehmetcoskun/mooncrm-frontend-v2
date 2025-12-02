import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Appointments } from '@/features/appointments';

export const Route = createFileRoute('/_authenticated/appointments/')({
  component: withOrganizationRequired(Appointments),
});
