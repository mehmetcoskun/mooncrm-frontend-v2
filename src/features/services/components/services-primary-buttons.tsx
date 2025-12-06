import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useServices } from './services-provider';

export function ServicesPrimaryButtons() {
  const { setOpen } = useServices();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('service_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Hizmet Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
