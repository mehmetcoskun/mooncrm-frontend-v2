import { usePermissions } from '@/hooks/use-permissions';
import { EmailTemplatesActionDialog } from './email-templates-action-dialog';
import { EmailTemplatesDeleteDialog } from './email-templates-delete-dialog';
import { useEmailTemplates } from './email-templates-provider';

type EmailTemplatesDialogsProps = {
  onSuccess?: () => void;
};

export function EmailTemplatesDialogs({
  onSuccess,
}: EmailTemplatesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useEmailTemplates();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('email_template_Create');
  const canEdit = hasPermission('email_template_Edit');
  const canDelete = hasPermission('email_template_Delete');

  return (
    <>
      {canCreate && (
        <EmailTemplatesActionDialog
          key="email-template-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <EmailTemplatesActionDialog
              key={`email-template-edit-${currentRow.id}`}
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
            <EmailTemplatesDeleteDialog
              key={`email-template-delete-${currentRow.id}`}
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
