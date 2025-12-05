import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiAssistants } from './ai-assistants-provider';

export function AiAssistantsPrimaryButtons() {
  const { setOpen } = useAiAssistants();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>AI Asistan Ekle</span> <Plus size={18} />
      </Button>
    </div>
  );
}
