import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTags } from './tags-provider';

export function TagsPrimaryButtons() {
  const { setOpen } = useTags();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Etiket Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
