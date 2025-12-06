import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Hotels } from '@/features/hotels';

const HotelsWithAuth = withPermissionRequired(
  withOrganizationRequired(Hotels),
  { permission: 'hotel_Access' }
);

export const Route = createFileRoute('/_authenticated/hotels/')({
  component: HotelsWithAuth,
});
