import { Shield } from 'lucide-react';
import { usePermissions as usePermissionsHook } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { usePermissions } from './permissions-provider';

export function PermissionsPrimaryButtons() {
  const { setOpen } = usePermissions();

  const { hasPermission } = usePermissionsHook();

  const canCreate = hasPermission('permission_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>İzin Ekle</span> <Shield size={18} />
        </Button>
      )}
    </div>
  );
}
