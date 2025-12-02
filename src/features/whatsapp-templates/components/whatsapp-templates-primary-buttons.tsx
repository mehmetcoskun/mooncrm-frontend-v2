import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWhatsappTemplates } from './whatsapp-templates-provider';

export function WhatsappTemplatesPrimaryButtons() {
  const { setOpen } = useWhatsappTemplates();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>WhatsApp Şablon Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
