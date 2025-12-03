import { useState } from 'react';
import { AxiosError } from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type Row } from '@tanstack/react-table';
import {
  startSession,
  stopSession,
  getSession,
} from '@/services/whatsapp-service';
import { QrCode, Play, Pause, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { type WhatsappSession } from '../data/schema';
import { useWhatsappSessions } from './whatsapp-sessions-provider';

type DataTableRowActionsProps = {
  row: Row<WhatsappSession>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useWhatsappSessions();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const canDelete = hasPermission('whatsapp_session_Delete');

  const { data: sessionInfo } = useQuery({
    queryKey: ['whatsapp-session-status', row.original.title],
    queryFn: () => getSession(row.original.title),
    refetchInterval: 10000,
  });

  const status = sessionInfo?.status || 'unknown';

  const isQrCodeDisabled = [
    'WORKING',
    'STARTING',
    'STOPPED',
    'FAILED',
  ].includes(status);

  const isStartDisabled = [
    'WORKING',
    'SCAN_QR_CODE',
    'STARTING',
    'FAILED',
  ].includes(status);

  const isStopDisabled = status === 'STOPPED';

  const handleQrCode = () => {
    setCurrentRow(row.original);
    setOpen('qr');
  };

  const handleStart = async () => {
    try {
      setIsStarting(true);
      await startSession(row.original.title);
      toast.success('WhatsApp oturumu başlatıldı', {
        description: `${row.original.title} oturumu başarıyla başlatıldı.`,
      });
      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-session-status', row.original.title],
      });
    } catch (error) {
      toast.error('Hata', {
        description: `İşlem sırasında bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    try {
      setIsStopping(true);
      await stopSession(row.original.title);
      toast.success('WhatsApp oturumu durduruldu', {
        description: `${row.original.title} oturumu başarıyla durduruldu.`,
      });
      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-session-status', row.original.title],
      });
    } catch (error) {
      toast.error('Hata', {
        description: `İşlem sırasında bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleQrCode}
        disabled={isQrCodeDisabled}
        title="QR Kod"
      >
        <QrCode className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStart}
        disabled={isStarting || isStartDisabled}
        title="Başlat"
      >
        <Play className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStop}
        disabled={isStopping || isStopDisabled}
        title="Durdur"
      >
        <Pause className="h-4 w-4" />
      </Button>
      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCurrentRow(row.original);
            setOpen('delete');
          }}
          title="Sil"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
