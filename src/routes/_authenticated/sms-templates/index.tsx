import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { SmsTemplates } from '@/features/sms-templates';

const SmsTemplatesWithAuth = withPermissionRequired(
  withOrganizationRequired(SmsTemplates),
  { permission: 'sms_template_Access' }
);

export const Route = createFileRoute('/_authenticated/sms-templates/')({
  component: SmsTemplatesWithAuth,
});
