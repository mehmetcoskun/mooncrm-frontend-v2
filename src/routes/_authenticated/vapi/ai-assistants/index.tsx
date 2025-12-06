import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { AiAssistants } from '@/features/vapi/ai-assistants';

const AiAssistantsWithAuth = withPermissionRequired(
  withOrganizationRequired(AiAssistants),
  { permission: 'ai_assistant_Access' }
);

export const Route = createFileRoute('/_authenticated/vapi/ai-assistants/')({
  component: AiAssistantsWithAuth,
});
