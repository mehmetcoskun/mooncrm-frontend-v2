import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Doctors } from '@/features/doctors';

export const Route = createFileRoute('/_authenticated/doctors/')({
  component: withOrganizationRequired(Doctors),
});
