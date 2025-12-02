import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { WhatsappSessions } from '@/features/whatsapp-sessions';

export const Route = createFileRoute('/_authenticated/whatsapp-sessions/')({
  component: withOrganizationRequired(WhatsappSessions),
});
