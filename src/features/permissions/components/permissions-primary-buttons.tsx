import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePermissions } from './permissions-provider';

export function PermissionsPrimaryButtons() {
  const { setOpen } = usePermissions();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>İzin Ekle</span> <Shield size={18} />
      </Button>
    </div>
  );
}
