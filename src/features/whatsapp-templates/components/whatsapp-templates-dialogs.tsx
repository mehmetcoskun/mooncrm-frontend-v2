import { usePermissions } from '@/hooks/use-permissions';
import { WhatsappTemplatesActionDialog } from './whatsapp-templates-action-dialog';
import { WhatsappTemplatesDeleteDialog } from './whatsapp-templates-delete-dialog';
import { useWhatsappTemplates } from './whatsapp-templates-provider';

type WhatsappTemplatesDialogsProps = {
  onSuccess?: () => void;
};

export function WhatsappTemplatesDialogs({
  onSuccess,
}: WhatsappTemplatesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useWhatsappTemplates();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('whatsapp_template_Create');
  const canEdit = hasPermission('whatsapp_template_Edit');
  const canDelete = hasPermission('whatsapp_template_Delete');

  return (
    <>
      {canCreate && (
        <WhatsappTemplatesActionDialog
          key="whatsapp-template-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <WhatsappTemplatesActionDialog
              key={`whatsapp-template-edit-${currentRow.id}`}
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
            <WhatsappTemplatesDeleteDialog
              key={`whatsapp-template-delete-${currentRow.id}`}
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
