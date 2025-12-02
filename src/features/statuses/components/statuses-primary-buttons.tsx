import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStatuses } from './statuses-provider';

export function StatusesPrimaryButtons() {
  const { setOpen } = useStatuses();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Durum Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
