import { usePermissions } from '@/hooks/use-permissions';
import { SmsTemplatesActionDialog } from './sms-templates-action-dialog';
import { SmsTemplatesDeleteDialog } from './sms-templates-delete-dialog';
import { useSmsTemplates } from './sms-templates-provider';

type SmsTemplatesDialogsProps = {
  onSuccess?: () => void;
};

export function SmsTemplatesDialogs({ onSuccess }: SmsTemplatesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useSmsTemplates();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('sms_template_Create');
  const canEdit = hasPermission('sms_template_Edit');
  const canDelete = hasPermission('sms_template_Delete');

  return (
    <>
      {canCreate && (
        <SmsTemplatesActionDialog
          key="sms-template-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <SmsTemplatesActionDialog
              key={`sms-template-edit-${currentRow.id}`}
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

          {canDelete && (
            <SmsTemplatesDeleteDialog
              key={`sms-template-delete-${currentRow.id}`}
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
