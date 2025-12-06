import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useSmsTemplates } from './sms-templates-provider';

export function SmsTemplatesPrimaryButtons() {
  const { setOpen } = useSmsTemplates();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('sms_template_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>SMS Şablon Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
