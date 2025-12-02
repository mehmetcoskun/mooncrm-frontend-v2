import { Funnel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSegments } from './segments-provider';

export function SegmentsPrimaryButtons() {
  const { setOpen } = useSegments();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Segment Ekle</span> <Funnel size={18} />
      </Button>
    </div>
  );
}
