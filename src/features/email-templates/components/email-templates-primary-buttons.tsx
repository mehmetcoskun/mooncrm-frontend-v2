import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useEmailTemplates } from './email-templates-provider';

export function EmailTemplatesPrimaryButtons() {
  const { setOpen } = useEmailTemplates();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('email_template_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>E-Posta Şablon Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
