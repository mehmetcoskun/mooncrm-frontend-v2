import { usePermissions } from '@/hooks/use-permissions';
import { AiAssistantsActionDialog } from './ai-assistants-action-dialog';
import { AiAssistantsDeleteDialog } from './ai-assistants-delete-dialog';
import { useAiAssistants } from './ai-assistants-provider';

type AiAssistantsDialogsProps = {
  onSuccess?: () => void;
};

export function AiAssistantsDialogs({ onSuccess }: AiAssistantsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useAiAssistants();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('vapi_AssistantCreate');
  const canEdit = hasPermission('vapi_AssistantEdit');
  const canDelete = hasPermission('vapi_AssistantDelete');

  return (
    <>
      {canCreate && (
        <AiAssistantsActionDialog
          key="ai-assistant-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <AiAssistantsActionDialog
              key={`ai-assistant-edit-${currentRow.id}`}
              open={open === 'edit'}
              onOpenChange={() => {
                setOpen('edit');
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }}
              currentRow={currentRow}
              onSuccess={onSuccess}
            />
          )}

          {canDelete && (
            <AiAssistantsDeleteDialog
              key={`ai-assistant-delete-${currentRow.id}`}
              open={open === 'delete'}
              onOpenChange={() => {
                setOpen('delete');
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }}
              currentRow={currentRow}
              onSuccess={onSuccess}
            />
          )}
        </>
      )}
    </>
  );
}
