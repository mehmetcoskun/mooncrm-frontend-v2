import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { EmailTemplates } from '@/features/email-templates';

const EmailTemplatesWithAuth = withPermissionRequired(
  withOrganizationRequired(EmailTemplates),
  { permission: 'email_template_Access' }
);

export const Route = createFileRoute('/_authenticated/email-templates/')({
  component: EmailTemplatesWithAuth,
});
