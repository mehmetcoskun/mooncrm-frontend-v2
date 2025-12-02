import { usePermissions } from '@/hooks/use-permissions';
import { SegmentsActionDialog } from './segments-action-dialog';
import { SegmentsDeleteDialog } from './segments-delete-dialog';
import { SegmentsWhatsappDialog } from './segments-whatsapp-dialog';
import { SegmentsMailDialog } from './segments-mail-dialog';
import { SegmentsSmsDialog } from './segments-sms-dialog';
import { SegmentsPhoneDialog } from './segments-phone-dialog';
import { useSegments } from './segments-provider';

type SegmentsDialogsProps = {
  onSuccess?: () => void;
};

export function SegmentsDialogs({ onSuccess }: SegmentsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useSegments();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('segment_Create');
  const canEdit = hasPermission('segment_Edit');
  const canDelete = hasPermission('segment_Delete');

  return (
    <>
      {canCreate && (
        <SegmentsActionDialog
          key="segment-add"
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
          onSuccess={onSuccess}
        />
      )}

      {currentRow && (
        <>
          {canEdit && (
            <SegmentsActionDialog
              key={`segment-edit-${currentRow.id}`}
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
            <SegmentsDeleteDialog
              key={`segment-delete-${currentRow.id}`}
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

          <SegmentsWhatsappDialog
            key={`segment-whatsapp-${currentRow.id}`}
            open={open === 'whatsapp'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }
            }}
            currentRow={currentRow}
            onSuccess={onSuccess}
          />

          <SegmentsMailDialog
            key={`segment-mail-${currentRow.id}`}
            open={open === 'mail'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }
            }}
            currentRow={currentRow}
            onSuccess={onSuccess}
          />

          <SegmentsSmsDialog
            key={`segment-sms-${currentRow.id}`}
            open={open === 'sms'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }
            }}
            currentRow={currentRow}
            onSuccess={onSuccess}
          />

          <SegmentsPhoneDialog
            key={`segment-phone-${currentRow.id}`}
            open={open === 'phone'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
              }
            }}
            currentRow={currentRow}
            onSuccess={onSuccess}
          />
        </>
      )}
    </>
  );
}
