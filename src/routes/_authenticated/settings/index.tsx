import { createFileRoute } from '@tanstack/react-router';
import { withOrganizationRequired } from '@/components/auth/with-organization-required';
import { withPermissionRequired } from '@/components/auth/with-permission-required';
import { Settings } from '@/features/settings';

const SettingsWithAuth = withPermissionRequired(
  withOrganizationRequired(Settings),
  { permission: 'setting_Access' }
);

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsWithAuth,
});
