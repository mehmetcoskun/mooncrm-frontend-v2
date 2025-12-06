import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { useAiAssistants } from './ai-assistants-provider';

export function AiAssistantsPrimaryButtons() {
  const { setOpen } = useAiAssistants();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('ai_assistant_Create');

  return (
    <div className="flex gap-2">
      {canCreate && (
        <Button className="space-x-1" onClick={() => setOpen('add')}>
          <span>AI Asistan Ekle</span> <Plus size={18} />
        </Button>
      )}
    </div>
  );
}
