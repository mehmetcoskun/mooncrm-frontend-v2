import { usePermissions } from '@/hooks/use-permissions';
import { WhatsappSessionsActionDialog } from './whatsapp-sessions-action-dialog';
import { WhatsappSessionsDeleteDialog } from './whatsapp-sessions-delete-dialog';
import { useWhatsappSessions } from './whatsapp-sessions-provider';
import { WhatsappSessionsQrCodeDialog } from './whatsapp-sessions-qr-code-dialog';

type WhatsappSessionsDialogsProps = {
  onSuccess?: () => void;
};

export function WhatsappSessionsDialogs({
  onSuccess,
}: WhatsappSessionsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useWhatsappSessions();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('whatsapp_session_Create');
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
          <WhatsappSessionsQrCodeDialog
            key={`whatsapp-session-qr-${currentRow.id}`}
            open={open === 'qr'}
            onOpenChange={() => {
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            sessionTitle={currentRow.title}
          />

          {canDelete && (
            <WhatsappSessionsDeleteDialog
              key={`whatsapp-session-delete-${currentRow.id}`}
              open={open === 'delete'}
              onOpenChange={() => {
                setOpen(null);
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
