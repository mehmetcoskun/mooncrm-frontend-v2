import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useTransfers } from './transfers-provider';

export function TransfersPrimaryButtons() {
  const { setOpen } = useTransfers();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('transfer_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Transfer Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
