import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Calendar } from '@/features/calendar';

const CalendarWithAuth = withPermissionRequired(
  withOrganizationRequired(Calendar),
  { permission: 'calendar_Access' }
);

export const Route = createFileRoute('/_authenticated/calendar/')({
  component: CalendarWithAuth,
});
