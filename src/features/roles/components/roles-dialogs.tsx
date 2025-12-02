import { usePermissions } from '@/hooks/use-permissions';
import { RolesActionDialog } from './roles-action-dialog';
import { RolesDeleteDialog } from './roles-delete-dialog';
import { useRoles } from './roles-provider';

type RolesDialogsProps = {
  onSuccess?: () => void;
};

export function RolesDialogs({ onSuccess }: RolesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useRoles();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('role_Create');
  const canEdit = hasPermission('role_Edit');
  const canDelete = hasPermission('role_Delete');

  return (
    <>
      {canCreate && (
        <RolesActionDialog
          key="permission-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <RolesActionDialog
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
            <RolesDeleteDialog
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
