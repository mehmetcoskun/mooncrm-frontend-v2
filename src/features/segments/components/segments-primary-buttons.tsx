import { Funnel } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useSegments } from './segments-provider';

export function SegmentsPrimaryButtons() {
  const { setOpen } = useSegments();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('segment_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Segment Ekle</span> <Funnel size={18} />
        </Button>
      )}
    </div>
  );
}
