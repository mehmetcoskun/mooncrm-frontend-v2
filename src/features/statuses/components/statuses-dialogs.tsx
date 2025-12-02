import { usePermissions } from '@/hooks/use-permissions';
import { StatusesActionDialog } from './statuses-action-dialog';
import { StatusesDeleteDialog } from './statuses-delete-dialog';
import { useStatuses } from './statuses-provider';

type StatusesDialogsProps = {
  onSuccess?: () => void;
};

export function StatusesDialogs({ onSuccess }: StatusesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useStatuses();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('status_Create');
  const canEdit = hasPermission('status_Edit');
  const canDelete = hasPermission('status_Delete');

  return (
    <>
      {canCreate && (
        <StatusesActionDialog
          key="status-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <StatusesActionDialog
              key={`status-edit-${currentRow.id}`}
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
            <StatusesDeleteDialog
              key={`status-delete-${currentRow.id}`}
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
