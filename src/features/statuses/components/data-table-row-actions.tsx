import { type Row } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { type Status } from '../data/schema';
import { useStatuses } from './statuses-provider';

type DataTableRowActionsProps = {
  row: Row<Status>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useStatuses();

  const { hasPermission, isSuperUser } = usePermissions();

  const canEdit = hasPermission('status_Edit');
  const canDelete = hasPermission('status_Delete');

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
