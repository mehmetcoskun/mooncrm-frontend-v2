import { type Row } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { type WhatsappTemplate } from '../data/schema';
import { useWhatsappTemplates } from './whatsapp-templates-provider';

type DataTableRowActionsProps = {
  row: Row<WhatsappTemplate>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useWhatsappTemplates();

  const { hasPermission } = usePermissions();

  const canEdit = hasPermission('whatsapp_template_Edit');
  const canDelete = hasPermission('whatsapp_template_Delete');

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
