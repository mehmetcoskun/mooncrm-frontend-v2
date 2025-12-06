import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { usePhoneNumbers } from './phone-numbers-provider';

export function PhoneNumbersPrimaryButtons() {
  const { setOpen } = usePhoneNumbers();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('phone_number_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Telefon Numarası Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
