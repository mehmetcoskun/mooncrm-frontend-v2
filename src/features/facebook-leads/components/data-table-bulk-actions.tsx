import { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table';
import { type FacebookLead } from '../data/schema';
import { FacebookLeadsBulkSendDialog } from './facebook-leads-bulk-send-dialog';

type DataTableBulkActionsProps = {
  table: Table<FacebookLead>;
  onSuccess?: () => void;
};

export function DataTableBulkActions({
  table,
  onSuccess,
}: DataTableBulkActionsProps) {
  const [showSendDialog, setShowSendDialog] = useState(false);

  return (
    <>
      <BulkActionsToolbar table={table} entityName="lead">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
              onClick={() => setShowSendDialog(true)}
                className="size-8"
              aria-label="Toplu CRM'e gönder"
              title="Toplu CRM'e gönder"
              >
              <Send className="size-4" />
              <span className="sr-only">Toplu CRM'e gönder</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
            <p>Toplu CRM'e gönder</p>
            </TooltipContent>
          </Tooltip>
      </BulkActionsToolbar>

      <FacebookLeadsBulkSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
          table={table}
          onSuccess={onSuccess}
        />
    </>
  );
}
