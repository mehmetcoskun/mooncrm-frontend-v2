import { type Row } from '@tanstack/react-table';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { type WebForm } from '../data/schema';
import { useWebForms } from './web-forms-provider';

type DataTableRowActionsProps = {
  row: Row<WebForm>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useWebForms();

  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('web_form_Create');
  const canEdit = hasPermission('web_form_Edit');
  const canDelete = hasPermission('web_form_Delete');

  if (!canCreate && !canEdit && !canDelete) return null;

  return (
    <div className="flex items-center gap-2">
      {canCreate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentRow(row.original);
            setOpen('duplicate');
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
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
