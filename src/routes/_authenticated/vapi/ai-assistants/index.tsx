import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { AiAssistants } from '@/features/vapi/ai-assistants';

export const Route = createFileRoute('/_authenticated/vapi/ai-assistants/')({
  component: withOrganizationRequired(AiAssistants),
});
