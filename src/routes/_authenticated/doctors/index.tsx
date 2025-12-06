import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Doctors } from '@/features/doctors';

const DoctorsWithAuth = withPermissionRequired(
  withOrganizationRequired(Doctors),
  { permission: 'doctor_Access' }
);

export const Route = createFileRoute('/_authenticated/doctors/')({
  component: DoctorsWithAuth,
});
