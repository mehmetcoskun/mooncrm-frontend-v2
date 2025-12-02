import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { WhatsappTemplates } from '@/features/whatsapp-templates';

export const Route = createFileRoute('/_authenticated/whatsapp-templates/')({
  component: withOrganizationRequired(WhatsappTemplates),
});
