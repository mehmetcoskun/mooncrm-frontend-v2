import { usePermissions } from '@/hooks/use-permissions';
import { PhoneNumbersActionDialog } from './phone-numbers-action-dialog';
import { PhoneNumbersCallDialog } from './phone-numbers-call-dialog';
import { PhoneNumbersDeleteDialog } from './phone-numbers-delete-dialog';
import { usePhoneNumbers } from './phone-numbers-provider';

type PhoneNumbersDialogsProps = {
  onSuccess?: () => void;
};

export function PhoneNumbersDialogs({ onSuccess }: PhoneNumbersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = usePhoneNumbers();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('vapi_PhoneNumberCreate');
  const canEdit = hasPermission('vapi_PhoneNumberEdit');
  const canDelete = hasPermission('vapi_PhoneNumberDelete');
  const canCall = hasPermission('vapi_PhoneNumberCall');

  return (
    <>
      {canCreate && (
        <PhoneNumbersActionDialog
          key="phone-number-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <PhoneNumbersActionDialog
              key={`phone-number-edit-${currentRow.id}`}
              open={open === 'edit'}
              onOpenChange={() => {
                setOpen('edit');
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }}
              currentRow={currentRow}
              onSuccess={onSuccess}
            />
          )}

          {canCall && (
            <PhoneNumbersCallDialog
              key={`phone-number-call-${currentRow.id}`}
              open={open === 'call'}
              onOpenChange={() => {
                setOpen('call');
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }}
              currentRow={currentRow}
              onSuccess={onSuccess}
            />
          )}

          {canDelete && (
            <PhoneNumbersDeleteDialog
              key={`phone-number-delete-${currentRow.id}`}
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
