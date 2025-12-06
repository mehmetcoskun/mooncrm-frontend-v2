import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { WhatsappSessions } from '@/features/whatsapp-sessions';

const WhatsappSessionsWithAuth = withPermissionRequired(
  withOrganizationRequired(WhatsappSessions),
  { permission: 'whatsapp_session_Access' }
);

export const Route = createFileRoute('/_authenticated/whatsapp-sessions/')({
  component: WhatsappSessionsWithAuth,
});
