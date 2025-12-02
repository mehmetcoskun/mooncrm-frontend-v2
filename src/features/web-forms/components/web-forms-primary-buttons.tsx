import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebForms } from './web-forms-provider';

export function WebFormsPrimaryButtons() {
  const { setOpen } = useWebForms();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Web Formu Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
