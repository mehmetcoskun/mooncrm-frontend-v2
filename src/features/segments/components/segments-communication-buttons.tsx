import { useQuery } from '@tanstack/react-query';
import { getSetting } from '@/services/setting-service';
import { Mail, MessageSquare, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Segment } from '../data/schema';
import { useSegments } from './segments-provider';

type SegmentsCommunicationButtonsProps = {
  segment: Segment;
};

export function SegmentsCommunicationButtons({
  segment,
}: SegmentsCommunicationButtonsProps) {
  const { setOpen, setCurrentRow } = useSegments();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSetting,
  });

  const isWhatsappDisabled = !settings?.whatsapp_settings;
  const isSmsDisabled = !settings?.sms_settings;
  const isEmailDisabled = !settings?.mail_settings;
  const isCallDisabled = !settings?.vapi_settings;

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => {
          setCurrentRow(segment);
          setOpen('whatsapp');
        }}
        title="WhatsApp"
        disabled={isWhatsappDisabled}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => {
          setCurrentRow(segment);
          setOpen('mail');
        }}
        title="E-posta"
        disabled={isEmailDisabled}
      >
        <Mail className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => {
          setCurrentRow(segment);
          setOpen('sms');
        }}
        title="SMS"
        disabled={isSmsDisabled}
      >
        <Send className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => {
          setCurrentRow(segment);
          setOpen('phone');
        }}
        title="Telefon"
        disabled={isCallDisabled}
      >
        <Phone className="h-4 w-4" />
      </Button>
    </div>
  );
}
