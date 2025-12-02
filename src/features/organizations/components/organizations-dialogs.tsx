import { usePermissions } from '@/hooks/use-permissions';
import { OrganizationsActionDialog } from './organizations-action-dialog';
import { OrganizationsDeleteDialog } from './organizations-delete-dialog';
import { useOrganizations } from './organizations-provider';

type OrganizationsDialogsProps = {
  onSuccess?: () => void;
};

export function OrganizationsDialogs({ onSuccess }: OrganizationsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useOrganizations();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('organization_Create');
  const canEdit = hasPermission('organization_Edit');
  const canDelete = hasPermission('organization_Delete');

  return (
    <>
      {canCreate && (
        <OrganizationsActionDialog
          key="organization-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <OrganizationsActionDialog
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
            <OrganizationsDeleteDialog
              key={`organization-delete-${currentRow.id}`}
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
