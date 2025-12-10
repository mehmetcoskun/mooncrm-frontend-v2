import { useState } from 'react';
import { type Row } from '@tanstack/react-table';
import { Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type FacebookLead } from '../data/schema';
import { useFacebookLeads } from './facebook-leads-provider';
import { FacebookLeadsSendDialog } from './facebook-leads-send-dialog';

type DataTableRowActionsProps = {
  row: Row<FacebookLead>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useFacebookLeads();
  const [showSendDialog, setShowSendDialog] = useState(false);

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSendDialog(true)}
        >
          <Send className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentRow(row.original);
            setOpen('view');
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      <FacebookLeadsSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        currentRow={row.original}
      />
    </>
  );
}
