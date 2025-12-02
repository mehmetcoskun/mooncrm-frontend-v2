import { usePermissions } from '@/hooks/use-permissions';
import { WebFormsActionDialog } from './web-forms-action-dialog';
import { WebFormsDeleteDialog } from './web-forms-delete-dialog';
import { useWebForms } from './web-forms-provider';

type WebFormsDialogsProps = {
  onSuccess?: () => void;
};

export function WebFormsDialogs({ onSuccess }: WebFormsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useWebForms();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('web_form_Create');
  const canEdit = hasPermission('web_form_Edit');
  const canDelete = hasPermission('web_form_Delete');

  return (
    <>
      {canCreate && (
        <WebFormsActionDialog
          key="web-form-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <WebFormsActionDialog
              key={`web-form-edit-${currentRow.id}`}
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
            <WebFormsDeleteDialog
              key={`web-form-delete-${currentRow.id}`}
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
