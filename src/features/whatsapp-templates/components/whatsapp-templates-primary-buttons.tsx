import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useWhatsappTemplates } from './whatsapp-templates-provider';

export function WhatsappTemplatesPrimaryButtons() {
  const { setOpen } = useWhatsappTemplates();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('whatsapp_template_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>WhatsApp Şablon Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
