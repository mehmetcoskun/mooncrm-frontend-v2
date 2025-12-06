import { Shield } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useRoles } from './roles-provider';

export function RolesPrimaryButtons() {
  const { setOpen } = useRoles();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('role_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Rol Ekle</span> <Shield size={18} />
        </Button>
      )}
    </div>
  );
}
