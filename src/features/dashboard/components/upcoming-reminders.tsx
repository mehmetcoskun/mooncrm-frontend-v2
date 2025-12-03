import { formatDistanceToNow } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { tr } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Reminder {
  id: number;
  title: string;
  date: string;
  user: string;
  customer: string;
}

interface UpcomingRemindersProps {
  reminders: Reminder[];
}

export function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
        Yaklaşan hatırlatıcı bulunmuyor
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reminders.map((reminder) => {
        const initials = reminder.user
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        const timeDistance = formatDistanceToNow(new Date(reminder.date), {
          addSuffix: true,
          locale: tr,
        });

        return (
          <div key={reminder.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-wrap items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm leading-none font-medium">
                  {reminder.title || 'Hatırlatıcı'}
                </p>
                <p className="text-muted-foreground text-sm">
                  <Link
                    to="/customers/$customerId"
                    params={{ customerId: reminder.id.toString() }}
                    className="hover:underline"
                  >
                    {reminder.customer}
                  </Link>
                  {' - '}
                  {reminder.user}
                </p>
              </div>
              <div className="text-muted-foreground text-sm">
                {timeDistance}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
