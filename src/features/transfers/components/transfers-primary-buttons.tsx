import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransfers } from './transfers-provider';

export function TransfersPrimaryButtons() {
  const { setOpen } = useTransfers();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Transfer Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
