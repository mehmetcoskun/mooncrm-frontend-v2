import { UserPlus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useUsers } from './users-provider';

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('user_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Kullanıcı Ekle</span> <UserPlus size={18} />
        </Button>
      )}
    </div>
  );
}
