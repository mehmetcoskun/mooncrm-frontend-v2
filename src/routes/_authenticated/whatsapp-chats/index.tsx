import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { WhatsappChats } from '@/features/whatsapp-chats';

export const Route = createFileRoute('/_authenticated/whatsapp-chats/')({
  component: withOrganizationRequired(WhatsappChats),
});
