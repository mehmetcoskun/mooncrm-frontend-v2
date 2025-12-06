import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '@/services/appointment-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { LeadSwitch } from '@/components/lead-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { CalendarDialogs } from './components/calendar-dialogs';
import { CalendarProvider } from './components/calendar-provider';
import { CalendarView } from './components/calendar-view';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: [
      'calendar-appointments',
      currentDate.getMonth() + 1,
      currentDate.getFullYear(),
    ],
    queryFn: () =>
      getAppointments({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      }),
  });

  return (
    <CalendarProvider>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <LeadSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed fluid className="flex flex-col">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Takvim</h2>
            <p className="text-muted-foreground">
              Randevularınızı takvim görünümünde inceleyin.
            </p>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : (
            <CalendarView
              appointments={appointments}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          )}
        </div>
      </Main>

      <CalendarDialogs />
    </CalendarProvider>
  );
}
