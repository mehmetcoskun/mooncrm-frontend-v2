import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useWhatsappSessions } from './whatsapp-sessions-provider';

export function WhatsappSessionsPrimaryButtons() {
  const { setOpen } = useWhatsappSessions();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('whatsapp_session_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>WhatsApp Oturumu Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
