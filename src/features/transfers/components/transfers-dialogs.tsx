import { usePermissions } from '@/hooks/use-permissions';
import { TransfersActionDialog } from './transfers-action-dialog';
import { TransfersDeleteDialog } from './transfers-delete-dialog';
import { useTransfers } from './transfers-provider';

type TransfersDialogsProps = {
  onSuccess?: () => void;
};

export function TransfersDialogs({ onSuccess }: TransfersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useTransfers();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('transfer_Create');
  const canEdit = hasPermission('transfer_Edit');
  const canDelete = hasPermission('transfer_Delete');

  return (
    <>
      {canCreate && (
        <TransfersActionDialog
          key="transfer-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <TransfersActionDialog
              key={`transfer-edit-${currentRow.id}`}
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
            <TransfersDeleteDialog
              key={`transfer-delete-${currentRow.id}`}
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
