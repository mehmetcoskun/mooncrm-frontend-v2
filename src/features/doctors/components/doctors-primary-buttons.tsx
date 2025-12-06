import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useDoctors } from './doctors-provider';

export function DoctorsPrimaryButtons() {
  const { setOpen } = useDoctors();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('doctor_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Doktor Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
