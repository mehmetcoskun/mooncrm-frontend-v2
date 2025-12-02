import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { EmailTemplates } from '@/features/email-templates';

export const Route = createFileRoute('/_authenticated/email-templates/')({
  component: withOrganizationRequired(EmailTemplates),
});
