import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDoctors } from './doctors-provider';

export function DoctorsPrimaryButtons() {
  const { setOpen } = useDoctors();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Doktor Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
