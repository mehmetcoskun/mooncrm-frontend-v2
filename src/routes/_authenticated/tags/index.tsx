import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Tags } from '@/features/tags';

const TagsWithAuth = withPermissionRequired(withOrganizationRequired(Tags), {
  permission: 'tag_Access',
});

export const Route = createFileRoute('/_authenticated/tags/')({
  component: TagsWithAuth,
});
