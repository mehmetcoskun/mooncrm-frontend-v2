import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useCategories } from './categories-provider';

export function CategoriesPrimaryButtons() {
  const { setOpen } = useCategories();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('category_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Kategori Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
