import { useQuery } from '@tanstack/react-query';
import { getSession } from '@/services/whatsapp-service';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const SessionStatusCell = ({ title }: { title: string }) => {
  const { data: sessionInfo, isLoading } = useQuery({
    queryKey: ['whatsapp-session-status', title],
    queryFn: () => getSession(title),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground text-sm">Yükleniyor...</span>
      </div>
    );
  }

  const status = sessionInfo?.status || 'unknown';

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'WORKING':
        return { variant: 'default' as const, text: 'Çalışıyor' };
      case 'STARTING':
        return { variant: 'secondary' as const, text: 'Başlatılıyor' };
      case 'STOPPED':
        return { variant: 'outline' as const, text: 'Durduruldu' };
      case 'FAILED':
        return { variant: 'destructive' as const, text: 'Başarısız' };
      case 'SCAN_QR_CODE':
        return { variant: 'secondary' as const, text: 'QR Kod Bekliyor' };
      default:
        return { variant: 'outline' as const, text: 'Bilinmiyor' };
    }
  };

  const { variant, text } = getStatusConfig(status);

  return <Badge variant={variant}>{text}</Badge>;
};
