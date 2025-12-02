import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSmsTemplates } from './sms-templates-provider';

export function SmsTemplatesPrimaryButtons() {
  const { setOpen } = useSmsTemplates();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>SMS Şablon Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
