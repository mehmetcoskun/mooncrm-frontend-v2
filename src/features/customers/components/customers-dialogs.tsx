import { usePermissions } from '@/hooks/use-permissions';
import { CustomersActionDialog } from './customers-action-dialog';
import { CustomersCommunicationDialog } from './customers-communication-dialog';
import { CustomersDeleteDialog } from './customers-delete-dialog';
import { useCustomers } from './customers-provider';

type CustomersDialogsProps = {
  onSuccess?: () => void;
};

export function CustomersDialogs({ onSuccess }: CustomersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('customer_Create');
  const canDelete = hasPermission('customer_Delete');

  return (
    <>
      {canCreate && (
        <CustomersActionDialog
          key="customer-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          <CustomersCommunicationDialog
            key={`customer-communication-${currentRow.id}`}
            customer={currentRow}
            open={open === 'communication'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }
            }}
            onSuccess={onSuccess}
          />

          {canDelete && (
            <CustomersDeleteDialog
              key={`customer-delete-${currentRow.id}`}
              open={open === 'delete'}
              onOpenChange={() => {
                setOpen('delete');
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }}
              currentRow={currentRow}
              onSuccess={onSuccess}
            />
          )}
        </>
      )}
    </>
  );
}
