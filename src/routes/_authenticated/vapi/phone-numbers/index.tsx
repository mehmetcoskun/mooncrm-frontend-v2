import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { PhoneNumbers } from '@/features/vapi/phone-numbers';

const PhoneNumbersWithAuth = withPermissionRequired(
  withOrganizationRequired(PhoneNumbers),
  { permission: 'phone_number_Access' }
);

export const Route = createFileRoute('/_authenticated/vapi/phone-numbers/')({
  component: PhoneNumbersWithAuth,
});
