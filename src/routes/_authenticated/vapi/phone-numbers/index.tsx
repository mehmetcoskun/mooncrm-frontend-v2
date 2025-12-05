import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { PhoneNumbers } from '@/features/vapi/phone-numbers';

export const Route = createFileRoute('/_authenticated/vapi/phone-numbers/')({
  component: withOrganizationRequired(PhoneNumbers),
});
