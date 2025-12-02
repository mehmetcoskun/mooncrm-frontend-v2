import { usePermissions } from '@/hooks/use-permissions';
import { DoctorsActionDialog } from './doctors-action-dialog';
import { DoctorsDeleteDialog } from './doctors-delete-dialog';
import { useDoctors } from './doctors-provider';

type DoctorsDialogsProps = {
  onSuccess?: () => void;
};

export function DoctorsDialogs({ onSuccess }: DoctorsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useDoctors();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('doctor_Create');
  const canEdit = hasPermission('doctor_Edit');
  const canDelete = hasPermission('doctor_Delete');

  return (
    <>
      {canCreate && (
        <DoctorsActionDialog
          key="doctor-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <DoctorsActionDialog
              key={`doctor-edit-${currentRow.id}`}
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
            <DoctorsDeleteDialog
              key={`doctor-delete-${currentRow.id}`}
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
