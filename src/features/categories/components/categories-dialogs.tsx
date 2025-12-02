import { usePermissions } from '@/hooks/use-permissions';
import { CategoriesActionDialog } from './categories-action-dialog';
import { CategoriesDeleteDialog } from './categories-delete-dialog';
import { useCategories } from './categories-provider';

type CategoriesDialogsProps = {
  onSuccess?: () => void;
};

export function CategoriesDialogs({ onSuccess }: CategoriesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useCategories();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('category_Create');
  const canEdit = hasPermission('category_Edit');
  const canDelete = hasPermission('category_Delete');

  return (
    <>
      {canCreate && (
        <CategoriesActionDialog
          key="category-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <CategoriesActionDialog
              key={`category-edit-${currentRow.id}`}
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
            <CategoriesDeleteDialog
              key={`category-delete-${currentRow.id}`}
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
