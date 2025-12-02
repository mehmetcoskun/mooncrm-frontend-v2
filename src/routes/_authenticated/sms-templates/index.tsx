import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { SmsTemplates } from '@/features/sms-templates';

export const Route = createFileRoute('/_authenticated/sms-templates/')({
  component: withOrganizationRequired(SmsTemplates),
});
