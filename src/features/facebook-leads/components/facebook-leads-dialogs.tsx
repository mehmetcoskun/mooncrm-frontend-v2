import { FacebookLeadsViewDialog } from './facebook-leads-view-dialog';
import { useFacebookLeads } from './facebook-leads-provider';

export function FacebookLeadsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useFacebookLeads();

  return (
    <>
      {currentRow && (
        <FacebookLeadsViewDialog
          key={`facebook-lead-view-${currentRow.id}`}
          open={open === 'view'}
          onOpenChange={() => {
            setOpen('view');
            setTimeout(() => {
              setCurrentRow(null);
            }, 500);
          }}
          currentRow={currentRow}
        />
      )}
    </>
  );
}
