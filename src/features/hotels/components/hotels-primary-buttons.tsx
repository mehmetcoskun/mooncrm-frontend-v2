import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useHotels } from './hotels-provider';

export function HotelsPrimaryButtons() {
  const { setOpen } = useHotels();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('hotel_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Otel Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
