import { type Row } from '@tanstack/react-table';
import { Edit, Phone, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { type PhoneNumber } from '../data/schema';
import { usePhoneNumbers } from './phone-numbers-provider';

type DataTableRowActionsProps = {
  row: Row<PhoneNumber>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = usePhoneNumbers();

  const { hasPermission } = usePermissions();

  const canCall = hasPermission('vapi_PhoneNumberCall');
  const canEdit = hasPermission('vapi_PhoneNumberEdit');
  const canDelete = hasPermission('vapi_PhoneNumberDelete');

  if (!canCall && !canEdit && !canDelete) return null;

  return (
    <div className="flex items-center gap-2">
      {canCall && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentRow(row.original);
            setOpen('call');
          }}
        >
          <Phone className="h-4 w-4" />
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
