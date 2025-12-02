import { usePermissions } from '@/hooks/use-permissions';
import { ServicesActionDialog } from './services-action-dialog';
import { ServicesDeleteDialog } from './services-delete-dialog';
import { useServices } from './services-provider';

type ServicesDialogsProps = {
  onSuccess?: () => void;
};

export function ServicesDialogs({ onSuccess }: ServicesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useServices();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('service_Create');
  const canEdit = hasPermission('service_Edit');
  const canDelete = hasPermission('service_Delete');

  return (
    <>
      {canCreate && (
        <ServicesActionDialog
          key="service-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <ServicesActionDialog
              key={`service-edit-${currentRow.id}`}
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
            <ServicesDeleteDialog
              key={`service-delete-${currentRow.id}`}
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
