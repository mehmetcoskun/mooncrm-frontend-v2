import { formatDistanceToNow } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { tr } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DashboardUpcomingReminder {
  id: number;
  title: string;
  date: string;
  user: string;
  customer: string;
}

interface DashboardUpcomingRemindersProps {
  upcomingReminders: DashboardUpcomingReminder[];
}

export function DashboardUpcomingReminders({
  upcomingReminders,
}: DashboardUpcomingRemindersProps) {
  if (!upcomingReminders || upcomingReminders.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
        Yaklaşan hatırlatıcı bulunmuyor
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {upcomingReminders.map((upcomingReminder) => {
        const initials = upcomingReminder.user
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        const timeDistance = formatDistanceToNow(
          new Date(upcomingReminder.date),
          {
            addSuffix: true,
            locale: tr,
          }
        );

        return (
          <div key={upcomingReminder.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm leading-none font-medium">
                  {upcomingReminder.title || 'Hatırlatıcı'}
                </p>
                <span className="text-muted-foreground shrink-0 text-sm">
                  {timeDistance}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 truncate text-sm">
                <Link
                  to="/customers/$customerId"
                  params={{ customerId: upcomingReminder.id.toString() }}
                  className="hover:underline"
                >
                  {upcomingReminder.customer}
                </Link>
                {' - '}
                {upcomingReminder.user}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
