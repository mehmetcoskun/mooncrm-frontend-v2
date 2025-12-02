import { usePermissions } from '@/hooks/use-permissions';
import { UsersActionDialog } from './users-action-dialog';
import { UsersApiKeysSidebar } from './users-api-keys-sidebar';
import { UsersDeleteDialog } from './users-delete-dialog';
import { useUsers } from './users-provider';

type UsersDialogsProps = {
  onSuccess?: () => void;
};

export function UsersDialogs({ onSuccess }: UsersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('user_Create');
  const canEdit = hasPermission('user_Edit');
  const canDelete = hasPermission('user_Delete');
  const canManageApiKeys = hasPermission('user_ApiKeyAccess');

  return (
    <>
      {canCreate && (
        <UsersActionDialog
          key="user-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <UsersActionDialog
              key={`user-edit-${currentRow.id}`}
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
            <UsersDeleteDialog
              key={`user-delete-${currentRow.id}`}
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

          {canManageApiKeys && (
            <UsersApiKeysSidebar
              key={`user-api-keys-${currentRow.id}`}
              user={currentRow}
              open={open === 'api-keys'}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setOpen(null);
                  setTimeout(() => {
                    setCurrentRow(null);
                  }, 500);
                }
              }}
            />
          )}
        </>
      )}
    </>
  );
}
