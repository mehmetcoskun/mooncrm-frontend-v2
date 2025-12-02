import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { Segments } from '@/features/segments';

export const Route = createFileRoute('/_authenticated/segments/')({
  component: withOrganizationRequired(Segments),
});
