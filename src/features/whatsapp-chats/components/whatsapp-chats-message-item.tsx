import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getWhatsappMedia } from '@/services/whatsapp-service';
import { FileText, Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { type WhatsappMessage } from '../data/schema';

interface WhatsappChatsMessageItemProps {
  message: WhatsappMessage;
}

export function WhatsappChatsMessageItem({
  message,
}: WhatsappChatsMessageItemProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const isFromMe = message.fromMe;
  const timestamp = new Date(message.timestamp * 1000);

  useEffect(() => {
    if (message.hasMedia && message.media?.url) {
      setIsLoadingMedia(true);
      getWhatsappMedia(message.media.url)
        .then((url) => {
          setMediaUrl(url);
        })
        .finally(() => {
          setIsLoadingMedia(false);
        });
    }
  }, [message.hasMedia, message.media?.url]);

  const isImage = message.media?.mimetype?.startsWith('image/');
  const isAudio = message.media?.mimetype?.startsWith('audio/');
  const isDocument =
    message.media?.mimetype === 'application/pdf' ||
    message.media?.mimetype?.includes('document');

  return (
    <>
      <div
        className={cn(
          'chat-box max-w-72 px-3 py-2 break-words shadow-lg',
          isFromMe
            ? 'bg-primary/90 text-primary-foreground/75 self-end rounded-[16px_16px_0_16px]'
            : 'bg-muted self-start rounded-[16px_16px_16px_0]'
        )}
      >
        {message.hasMedia && (
          <div className="mb-2">
            {isLoadingMedia ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : mediaUrl ? (
              <>
                {isImage && (
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="cursor-pointer transition-opacity hover:opacity-90"
                  >
                    <img
                      src={mediaUrl}
                      alt="Resim"
                      className="max-w-full rounded-md"
                    />
                  </button>
                )}
                {isAudio && (
                  <div className="flex items-center gap-2">
                    <Mic size={16} />
                    <audio controls className="max-w-full">
                      <source src={mediaUrl} type={message.media?.mimetype} />
                      Tarayıcınız ses dosyasını desteklemiyor.
                    </audio>
                  </div>
                )}
                {isDocument && (
                  <a
                    href={mediaUrl}
                    download={message.media?.filename}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <FileText size={16} />
                    <span className="text-sm">
                      {message.media?.filename || 'Belge'}
                    </span>
                  </a>
                )}
              </>
            ) : (
              <div className="text-muted-foreground text-xs">
                Medya yüklenemedi
              </div>
            )}
          </div>
        )}

        {message.body && (
          <div
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: message.body
                .replace(
                  /```([^`]+)```/g,
                  '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>'
                )
                .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                .replace(/_([^_]+)_/g, '<em>$1</em>')
                .replace(/~([^~]+)~/g, '<del>$1</del>')
                .replace(/\n/g, '<br />'),
            }}
          />
        )}

        <span
          className={cn(
            'text-foreground/75 mt-1 block text-xs font-light italic',
            isFromMe && 'text-primary-foreground/85 text-end'
          )}
        >
          {format(timestamp, 'HH:mm')}
        </span>
      </div>

      {/* Resim Modal */}
      {isImage && mediaUrl && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-4xl p-0">
            <img
              src={mediaUrl}
              alt="Resim"
              className="h-auto w-full rounded-md"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
