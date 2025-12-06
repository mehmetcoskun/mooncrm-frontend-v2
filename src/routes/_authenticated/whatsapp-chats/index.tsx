import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { WhatsappChats } from '@/features/whatsapp-chats';

const WhatsappChatsWithAuth = withPermissionRequired(
  withOrganizationRequired(WhatsappChats),
  { permission: 'whatsapp_chat_Access' }
);

export const Route = createFileRoute('/_authenticated/whatsapp-chats/')({
  component: WhatsappChatsWithAuth,
});
