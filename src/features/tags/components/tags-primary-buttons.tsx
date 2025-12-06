import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useTags } from './tags-provider';

export function TagsPrimaryButtons() {
  const { setOpen } = useTags();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('tag_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Etiket Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
