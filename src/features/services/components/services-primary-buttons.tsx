import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServices } from './services-provider';

export function ServicesPrimaryButtons() {
  const { setOpen } = useServices();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Hizmet Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
