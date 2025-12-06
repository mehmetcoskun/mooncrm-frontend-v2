import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { WhatsappTemplates } from '@/features/whatsapp-templates';

const WhatsappTemplatesWithAuth = withPermissionRequired(
  withOrganizationRequired(WhatsappTemplates),
  { permission: 'whatsapp_template_Access' }
);

export const Route = createFileRoute('/_authenticated/whatsapp-templates/')({
  component: WhatsappTemplatesWithAuth,
});
