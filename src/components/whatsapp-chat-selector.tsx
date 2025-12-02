import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChats } from '@/services/whatsapp-service';
import { getWhatsappSessions } from '@/services/whatsapp-session-service';
import { AlertCircle, Loader2, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { WhatsappSession } from '@/features/whatsapp-sessions/data/schema';

type WhatsappChat = {
  id: string;
  name?: string;
};

type WhatsappChatSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectChat: (chatId: string) => void;
};

export function WhatsappChatSelector({
  open,
  onOpenChange,
  onSelectChat,
}: WhatsappChatSelectorProps) {
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [chats, setChats] = useState<WhatsappChat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ['whatsapp-sessions'],
    queryFn: getWhatsappSessions,
    enabled: open,
  });

  const adminSession = data?.find(
    (session: WhatsappSession) => session.is_admin
  );

  const handleLoadChats = async () => {
    if (!adminSession) return;

    try {
      setIsLoadingChats(true);
      const response = await getChats(adminSession.title, 100, 0);
      setChats(response || []);
      setChatsLoaded(true);
    } catch (_error) {
      setChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleChatSelect = (chat: WhatsappChat) => {
    if (chat?.id) {
      onSelectChat(chat.id);
      onOpenChange(false);
      // Reset state
      setChatsLoaded(false);
      setChats([]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Sohbet Seç
          </SheetTitle>
          <SheetDescription>
            Otele ait WhatsApp sohbetini seçin
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : !adminSession ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Admin Oturumu Gerekli!</AlertTitle>
              <AlertDescription>
                WhatsApp işlemleri için admin yetkisine sahip bir oturum
                oluşturmanız gerekmektedir.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="rounded-lg border p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium">Oturum</p>
                  <p className="text-muted-foreground text-sm">
                    {adminSession.title}
                  </p>
                </div>
                <Button
                  onClick={handleLoadChats}
                  disabled={isLoadingChats || chatsLoaded}
                  className="w-full"
                >
                  {isLoadingChats ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : chatsLoaded ? (
                    'Sohbetler Yüklendi'
                  ) : (
                    'Sohbetleri Yükle'
                  )}
                </Button>
              </div>

              {chatsLoaded && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Sohbetler ({chats.length})
                  </p>
                  <ScrollArea className="h-[500px] rounded-md border">
                    <div className="space-y-2 p-4">
                      {chats.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center text-sm">
                          Sohbet bulunamadı
                        </p>
                      ) : (
                        chats.map((chat) => (
                          <button
                            key={chat.id}
                            onClick={() => handleChatSelect(chat)}
                            className="hover:bg-accent w-full rounded-lg border p-3 text-left transition-colors"
                          >
                            <p className="text-sm font-medium">
                              {chat.name || chat.id}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
