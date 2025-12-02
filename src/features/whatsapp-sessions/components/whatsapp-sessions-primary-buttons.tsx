import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWhatsappSessions } from './whatsapp-sessions-provider';

export function WhatsappSessionsPrimaryButtons() {
  const { setOpen } = useWhatsappSessions();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>WhatsApp Oturumu Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
