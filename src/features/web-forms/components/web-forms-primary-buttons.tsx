import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useWebForms } from './web-forms-provider';

export function WebFormsPrimaryButtons() {
  const { setOpen } = useWebForms();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('web_form_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>Web Formu Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
