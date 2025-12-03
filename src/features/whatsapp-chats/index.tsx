import { useState, useEffect, useRef } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChatsOverview,
  getMessages,
  sendText,
  sendSeen,
  startTyping,
  stopTyping,
} from '@/services/whatsapp-service';
import { getWhatsappSessions } from '@/services/whatsapp-session-service';
import {
  ArrowLeft,
  Paperclip,
  ImagePlus,
  Plus,
  Search as SearchIcon,
  Send,
  MessagesSquare,
  ChevronDown,
  Check,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { type WhatsappSession } from '@/features/whatsapp-sessions/data/schema';
import { WhatsappAvatar } from './components/whatsapp-avatar';
import { WhatsappMessageItem } from './components/whatsapp-message-item';
import { type WhatsappChat, type WhatsappMessage } from './data/schema';

export function WhatsappChats() {
  const [search, setSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState<WhatsappChat | null>(null);
  const [mobileSelectedChat, setMobileSelectedChat] =
    useState<WhatsappChat | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<WhatsappSession | null>(null);
  const [limit, setLimit] = useState(50);
  const [messageLimit] = useState(50);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: whatsappSessions = [] } = useQuery({
    queryKey: ['whatsapp-sessions'],
    queryFn: getWhatsappSessions,
  });

  const { data: chatsData = [], isLoading: isLoadingChats } = useQuery({
    queryKey: ['whatsapp-chats', selectedSession?.title, limit],
    queryFn: () => getChatsOverview(selectedSession!.title, limit, 0),
    enabled: !!selectedSession,
  });

  const { data: messagesData = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: [
      'whatsapp-messages',
      selectedSession?.title,
      selectedChat?.id,
      messageLimit,
    ],
    queryFn: () =>
      getMessages(selectedSession!.title, selectedChat!.id, messageLimit),
    enabled: !!selectedSession && !!selectedChat,
  });

  const chatList: WhatsappChat[] =
    selectedSession && !isLoadingChats ? chatsData : [];

  const filteredChatList = chatList.filter((chat) =>
    (chat.name || chat.id || '')
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const groupedMessages = messagesData.reduce(
    (acc: Record<string, WhatsappMessage[]>, message: WhatsappMessage) => {
      const date = new Date(message.timestamp * 1000);
      const key = format(date, 'd MMM, yyyy');

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(message);

      return acc;
    },
    {}
  );

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      return await sendText({
        session: selectedSession!.title,
        chatId: selectedChat!.id,
        text,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'whatsapp-messages',
          selectedSession?.title,
          selectedChat?.id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['whatsapp-chats', selectedSession?.title],
      });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedSession || !selectedChat || isSending) {
      return;
    }

    setIsSending(true);

    try {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      await stopTyping({
        session: selectedSession.title,
        chatId: selectedChat.id,
      });

      await sendMessageMutation.mutateAsync(messageText);
      setMessageText('');
    } catch (_error) {
      // Hata sessizce yönetilir
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = async (value: string) => {
    setMessageText(value);

    if (!selectedSession || !selectedChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim()) {
      try {
        await startTyping({
          session: selectedSession.title,
          chatId: selectedChat.id,
        });

        typingTimeoutRef.current = setTimeout(async () => {
          try {
            await stopTyping({
              session: selectedSession.title,
              chatId: selectedChat.id,
            });
          } catch (_error) {
            // Hata sessizce yönetilir
          }
        }, 3000);
      } catch (_error) {
        // Hata sessizce yönetilir
      }
    } else {
      try {
        await stopTyping({
          session: selectedSession.title,
          chatId: selectedChat.id,
        });
      } catch (_error) {
        // Hata sessizce yönetilir
      }
    }
  };

  useEffect(() => {
    if (selectedSession && selectedChat) {
      const markAsRead = async () => {
        try {
          await sendSeen({
            session: selectedSession.title,
            chatId: selectedChat.id,
          });
          queryClient.invalidateQueries({
            queryKey: ['whatsapp-chats', selectedSession.title],
          });
        } catch (_error) {
          // Hata sessizce yönetilir
        }
      };
      markAsRead();
    }
  }, [selectedSession, selectedChat, queryClient]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      user?.whatsapp_session_id &&
      whatsappSessions.length > 0 &&
      !selectedSession
    ) {
      const userSession = whatsappSessions.find(
        (session: WhatsappSession) => session.id === user.whatsapp_session_id
      );
      if (userSession) {
        setSelectedSession(userSession);
      }
    }
  }, [user, whatsappSessions, selectedSession]);

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed fluid>
        <section className="flex h-full gap-6">
          <div className="flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80">
            <div className="bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none">
              <div className="flex items-center justify-between py-2">
                <div className="flex gap-2">
                  <h1 className="text-2xl font-bold">Sohbetler</h1>
                  <MessagesSquare size={20} />
                </div>
                {!user?.whatsapp_session_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      {whatsappSessions.map((session: WhatsappSession) => (
                        <DropdownMenuItem
                          key={session.id}
                          className="p-3"
                          onClick={() => {
                            setSelectedSession(session);
                          }}
                        >
                          <div className="flex w-full items-center gap-3">
                            <WhatsappAvatar
                              session={session.title}
                              phone={session.phone}
                            />
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-medium">
                                {session.title}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Bu oturuma geç
                              </span>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <label
                className={cn(
                  'focus-within:ring-ring focus-within:ring-1 focus-within:outline-hidden',
                  'border-border flex h-10 w-full items-center space-x-0 rounded-md border ps-2'
                )}
              >
                <SearchIcon size={15} className="me-2 stroke-slate-500" />
                <span className="sr-only">Sohbet Ara</span>
                <input
                  type="text"
                  className="w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden"
                  placeholder="Sohbet ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            <ScrollArea className="-mx-3 h-full overflow-scroll p-3">
              {!selectedSession ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessagesSquare className="text-muted-foreground mb-2 size-12" />
                  <p className="text-muted-foreground text-sm">
                    Sohbetleri görüntülemek için bir oturum seçin
                  </p>
                </div>
              ) : isLoadingChats ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    Sohbetler yükleniyor...
                  </p>
                </div>
              ) : filteredChatList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessagesSquare className="text-muted-foreground mb-2 size-12" />
                  <p className="text-muted-foreground text-sm">
                    {search ? 'Arama sonucu bulunamadı' : 'Henüz sohbet yok'}
                  </p>
                </div>
              ) : (
                <>
                  {filteredChatList.map((chat) => {
                    const chatName = chat.name || chat.id || 'Bilinmeyen';
                    const lastMessage = chat.lastMessage;
                    const lastMessageBody = lastMessage?.body || '';
                    const isFromMe = lastMessage?.fromMe || false;
                    const ackName = lastMessage?.ackName;

                    const hasUnreadMessage =
                      lastMessage &&
                      !lastMessage.fromMe &&
                      lastMessage.ackName === 'DEVICE';

                    const getMessageStatusIcon = () => {
                      if (!isFromMe) return null;

                      if (ackName === 'SERVER') {
                        return (
                          <Check size={14} className="text-muted-foreground" />
                        );
                      } else if (ackName === 'DEVICE') {
                        return (
                          <CheckCheck
                            size={14}
                            className="text-muted-foreground"
                          />
                        );
                      } else if (ackName === 'READ') {
                        return (
                          <CheckCheck size={14} className="text-blue-500" />
                        );
                      }
                      return null;
                    };

                    const truncatedMessage =
                      lastMessageBody.length > 50
                        ? `${lastMessageBody.substring(0, 50)}...`
                        : lastMessageBody;

                    return (
                      <Fragment key={chat.id}>
                        <button
                          type="button"
                          className={cn(
                            'group hover:bg-accent hover:text-accent-foreground',
                            `flex w-full rounded-md px-2 py-2 text-start text-sm`,
                            selectedChat?.id === chat.id && 'sm:bg-muted'
                          )}
                          onClick={() => {
                            setSelectedChat(chat);
                            setMobileSelectedChat(chat);
                          }}
                        >
                          <div className="flex w-full gap-2">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={chat.picture} alt={chatName} />
                              <AvatarFallback>
                                {chatName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="min-w-0 flex-1 font-medium">
                                  {chatName}
                                </span>
                                <div className="flex-shrink-0">
                                  {hasUnreadMessage ? (
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                  ) : (
                                    getMessageStatusIcon()
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground group-hover:text-accent-foreground/90 col-start-2 row-span-2 row-start-2 line-clamp-1 block text-xs text-ellipsis">
                                  {truncatedMessage}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                        <Separator className="my-1" />
                      </Fragment>
                    );
                  })}

                  {filteredChatList.length >= limit &&
                    chatsData.length >= limit && (
                      <div className="flex justify-center py-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setLimit((prev) => prev + 50);
                          }}
                        >
                          Daha fazlasını yükle
                        </Button>
                      </div>
                    )}
                </>
              )}
            </ScrollArea>
          </div>

          {selectedChat ? (
            <div
              className={cn(
                'bg-background absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md',
                mobileSelectedChat && 'start-0 flex'
              )}
            >
              <div className="bg-card mb-1 flex flex-none justify-between p-4 shadow-lg sm:rounded-t-md">
                <div className="flex gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="-ms-2 h-full sm:hidden"
                    onClick={() => setMobileSelectedChat(null)}
                  >
                    <ArrowLeft className="rtl:rotate-180" />
                  </Button>
                  <div className="flex items-center gap-2 lg:gap-4">
                    <Avatar className="size-9 lg:size-11">
                      <AvatarImage
                        src={selectedChat.picture}
                        alt={selectedChat.name || selectedChat.id}
                      />
                      <AvatarFallback>
                        {(selectedChat.name || selectedChat.id)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="col-start-2 row-span-2 text-sm font-medium lg:text-base">
                        {selectedChat.name || selectedChat.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4">
                <div className="flex size-full flex-1">
                  <div className="chat-text-container relative -me-4 flex flex-1 flex-col overflow-y-hidden">
                    <div className="chat-flex flex h-40 w-full grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pe-4 pb-4">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-muted-foreground text-sm">
                            Mesajlar yükleniyor...
                          </p>
                        </div>
                      ) : groupedMessages &&
                        Object.keys(groupedMessages).length > 0 ? (
                        Object.keys(groupedMessages).map((dateKey) => (
                          <Fragment key={dateKey}>
                            {groupedMessages[dateKey].map(
                              (message: WhatsappMessage) => (
                                <WhatsappMessageItem
                                  key={message.id}
                                  message={message}
                                />
                              )
                            )}
                            <div className="text-center text-xs">{dateKey}</div>
                          </Fragment>
                        ))
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-muted-foreground text-sm">
                            Henüz mesaj yok
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <form
                  className="flex w-full flex-none gap-2"
                  onSubmit={handleSendMessage}
                >
                  <div className="border-input bg-card focus-within:ring-ring flex flex-1 items-center gap-2 rounded-md border px-2 py-1 focus-within:ring-1 focus-within:outline-hidden lg:gap-4">
                    <div className="space-x-1">
                      <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        className="h-8 rounded-md"
                      >
                        <Plus size={20} className="stroke-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        className="hidden h-8 rounded-md lg:inline-flex"
                      >
                        <ImagePlus
                          size={20}
                          className="stroke-muted-foreground"
                        />
                      </Button>
                      <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        className="hidden h-8 rounded-md lg:inline-flex"
                      >
                        <Paperclip
                          size={20}
                          className="stroke-muted-foreground"
                        />
                      </Button>
                    </div>
                    <label className="flex-1">
                      <span className="sr-only">Mesaj Metni</span>
                      <input
                        type="text"
                        placeholder="Mesaj metni giriniz..."
                        className="h-8 w-full bg-inherit focus-visible:outline-hidden"
                        value={messageText}
                        onChange={(e) => handleTyping(e.target.value)}
                        disabled={isSending}
                      />
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="submit"
                      className="hidden sm:inline-flex"
                      disabled={isSending || !messageText.trim()}
                    >
                      <Send size={20} />
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="h-full sm:hidden"
                    disabled={isSending || !messageText.trim()}
                  >
                    <Send size={18} /> Gönder
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'bg-card absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs sm:static sm:z-auto sm:flex'
              )}
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="border-border flex size-16 items-center justify-center rounded-full border-2">
                  <MessagesSquare className="size-8" />
                </div>
                <div className="space-y-2 text-center">
                  <h1 className="text-xl font-semibold">Sohbetler</h1>
                  <p className="text-muted-foreground text-sm">
                    Bir sohbet başlatmak için bir mesaj gönderin.
                  </p>
                </div>
                <Button>Mesaj Gönder</Button>
              </div>
            </div>
          )}
        </section>
      </Main>
    </>
  );
}
