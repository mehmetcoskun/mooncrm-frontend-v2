import { type Row } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { usePermissions as usePermissionsHook } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { type Permission } from '../data/schema';
import { usePermissions } from './permissions-provider';

type DataTableRowActionsProps = {
  row: Row<Permission>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = usePermissions();

  const { hasPermission } = usePermissionsHook();

  const canEdit = hasPermission('permission_Edit');
  const canDelete = hasPermission('permission_Delete');

  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
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
