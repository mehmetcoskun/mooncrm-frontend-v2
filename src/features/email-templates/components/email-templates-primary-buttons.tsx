import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmailTemplates } from './email-templates-provider';

export function EmailTemplatesPrimaryButtons() {
  const { setOpen } = useEmailTemplates();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>E-Posta Şablon Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
