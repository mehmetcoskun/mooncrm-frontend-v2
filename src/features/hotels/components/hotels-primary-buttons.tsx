import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHotels } from './hotels-provider';

export function HotelsPrimaryButtons() {
  const { setOpen } = useHotels();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Otel Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
