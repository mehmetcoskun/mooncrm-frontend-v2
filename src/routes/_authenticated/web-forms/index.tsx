import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { WebForms } from '@/features/web-forms';

const WebFormsWithAuth = withPermissionRequired(
  withOrganizationRequired(WebForms),
  { permission: 'web_form_Access' }
);

export const Route = createFileRoute('/_authenticated/web-forms/')({
  component: WebFormsWithAuth,
});
