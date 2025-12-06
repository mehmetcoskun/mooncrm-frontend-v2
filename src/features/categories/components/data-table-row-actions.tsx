import { type Row } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { type Category } from '../data/schema';
import { useCategories } from './categories-provider';

type DataTableRowActionsProps = {
  row: Row<Category>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useCategories();

  const { hasPermission, isSuperUser } = usePermissions();

  const canEdit = hasPermission('category_Edit');
  const canDelete = hasPermission('category_Delete');

  const isDisabled = row.original.is_global && !isSuperUser();

  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isDisabled}
          onClick={() => {
            setCurrentRow(row.original);
            setOpen('edit');
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isDisabled}
          onClick={() => {
            setCurrentRow(row.original);
            setOpen('delete');
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
