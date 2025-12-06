import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Appointments } from '@/features/appointments';

const AppointmentsWithAuth = withPermissionRequired(
  withOrganizationRequired(Appointments),
  { permission: 'appointment_Access' }
);
export const Route = createFileRoute('/_authenticated/appointments/')({
  component: AppointmentsWithAuth,
});
