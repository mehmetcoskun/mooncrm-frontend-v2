import { usePermissions } from '@/hooks/use-permissions';
import { HotelsActionDialog } from './hotels-action-dialog';
import { HotelsDeleteDialog } from './hotels-delete-dialog';
import { useHotels } from './hotels-provider';

type HotelsDialogsProps = {
  onSuccess?: () => void;
};

export function HotelsDialogs({ onSuccess }: HotelsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useHotels();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('hotel_Create');
  const canEdit = hasPermission('hotel_Edit');
  const canDelete = hasPermission('hotel_Delete');

  return (
    <>
      {canCreate && (
        <HotelsActionDialog
          key="hotel-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <HotelsActionDialog
              key={`hotel-edit-${currentRow.id}`}
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
            <HotelsDeleteDialog
              key={`hotel-delete-${currentRow.id}`}
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
