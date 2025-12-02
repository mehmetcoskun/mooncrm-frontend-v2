import { usePermissions as usePermissionsHook } from '@/hooks/use-permissions';
import { PermissionsActionDialog } from './permissions-action-dialog';
import { PermissionsDeleteDialog } from './permissions-delete-dialog';
import { usePermissions } from './permissions-provider';

type PermissionsDialogsProps = {
  onSuccess?: () => void;
};

export function PermissionsDialogs({ onSuccess }: PermissionsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = usePermissions();
  const { hasPermission } = usePermissionsHook();

  const canCreate = hasPermission('permission_Create');
  const canEdit = hasPermission('permission_Edit');
  const canDelete = hasPermission('permission_Delete');

  return (
    <>
      {canCreate && (
        <PermissionsActionDialog
          key="permission-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <PermissionsActionDialog
              key={`organization-edit-${currentRow.id}`}
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
            <PermissionsDeleteDialog
              key={`permission-delete-${currentRow.id}`}
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
