import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useOrganizations } from './organizations-provider';

export function OrganizationsPrimaryButtons() {
  const { setOpen } = useOrganizations();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('organization_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Firma Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
