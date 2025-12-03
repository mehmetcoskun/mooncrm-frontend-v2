import { useNavigate } from '@tanstack/react-router';
import { type Row } from '@tanstack/react-table';
import { Edit, MessageSquare, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { type Customer } from '../data/schema';
import { useCustomers } from './customers-provider';

type DataTableRowActionsProps = {
  row: Row<Customer>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const navigate = useNavigate();
  const { setOpen, setCurrentRow } = useCustomers();

  const { hasPermission } = usePermissions();

  const canEdit = hasPermission('customer_Edit');
  const canDelete = hasPermission('customer_Delete');

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setCurrentRow(row.original);
          setOpen('communication');
        }}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: `/customers/${row.original.id}` })}
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
