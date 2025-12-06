import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Segments } from '@/features/segments';

const SegmentsWithAuth = withPermissionRequired(
  withOrganizationRequired(Segments),
  {
    permission: 'segment_Access',
  }
);

export const Route = createFileRoute('/_authenticated/segments/')({
  component: SegmentsWithAuth,
});
