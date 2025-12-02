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
      >
        <Phone className="h-4 w-4" />
      </Button>
    </div>
  );
}
