import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { WebForms } from '@/features/web-forms';

export const Route = createFileRoute('/_authenticated/web-forms/')({
  component: withOrganizationRequired(WebForms),
});
