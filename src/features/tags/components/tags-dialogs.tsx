import { usePermissions } from '@/hooks/use-permissions';
import { TagsActionDialog } from './tags-action-dialog';
import { TagsDeleteDialog } from './tags-delete-dialog';
import { useTags } from './tags-provider';

type TagsDialogsProps = {
  onSuccess?: () => void;
};

export function TagsDialogs({ onSuccess }: TagsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useTags();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('tag_Create');
  const canEdit = hasPermission('tag_Edit');
  const canDelete = hasPermission('tag_Delete');

  return (
    <>
      {canCreate && (
        <TagsActionDialog
          key="tag-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <TagsActionDialog
              key={`tag-edit-${currentRow.id}`}
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
            <TagsDeleteDialog
              key={`tag-delete-${currentRow.id}`}
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
