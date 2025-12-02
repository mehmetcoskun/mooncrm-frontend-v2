import { usePermissions } from '@/hooks/use-permissions';
import { WhatsappSessionsActionDialog } from './whatsapp-sessions-action-dialog';
import { WhatsappSessionsDeleteDialog } from './whatsapp-sessions-delete-dialog';
import { useWhatsappSessions } from './whatsapp-sessions-provider';

type WhatsappSessionsDialogsProps = {
  onSuccess?: () => void;
};

export function WhatsappSessionsDialogs({
  onSuccess,
}: WhatsappSessionsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useWhatsappSessions();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('whatsapp_session_Create');
  const canEdit = hasPermission('whatsapp_session_Edit');
  const canDelete = hasPermission('whatsapp_session_Delete');

  return (
    <>
      {canCreate && (
        <WhatsappSessionsActionDialog
          key="whatsapp-session-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <WhatsappSessionsActionDialog
              key={`whatsapp-session-edit-${currentRow.id}`}
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
            <WhatsappSessionsDeleteDialog
              key={`whatsapp-session-delete-${currentRow.id}`}
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
