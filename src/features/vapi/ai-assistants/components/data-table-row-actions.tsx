import { type Row } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { type AiAssistant } from '../data/schema';
import { useAiAssistants } from './ai-assistants-provider';

type DataTableRowActionsProps = {
  row: Row<AiAssistant>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useAiAssistants();

  const { hasPermission } = usePermissions();

  const canEdit = hasPermission('vapi_AssistantEdit');
  const canDelete = hasPermission('vapi_AssistantDelete');

  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentRow(row.original);
            setOpen('edit');
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentRow(row.original);
            setOpen('delete');
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
