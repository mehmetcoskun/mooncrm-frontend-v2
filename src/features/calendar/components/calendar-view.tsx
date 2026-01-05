'use client';

import { useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type CalendarAppointment } from '../data/schema';
import { useCalendar } from './calendar-provider';

const APPOINTMENT_COLORS = [
  {
    bg: 'rgba(59, 130, 246, 0.2)',
    border: 'rgb(59, 130, 246)',
    text: 'rgb(37, 99, 235)',
  },
  {
    bg: 'rgba(16, 185, 129, 0.2)',
    border: 'rgb(16, 185, 129)',
    text: 'rgb(5, 150, 105)',
  },
  {
    bg: 'rgba(245, 158, 11, 0.2)',
    border: 'rgb(245, 158, 11)',
    text: 'rgb(217, 119, 6)',
  },
  {
    bg: 'rgba(239, 68, 68, 0.2)',
    border: 'rgb(239, 68, 68)',
    text: 'rgb(220, 38, 38)',
  },
  {
    bg: 'rgba(168, 85, 247, 0.2)',
    border: 'rgb(168, 85, 247)',
    text: 'rgb(147, 51, 234)',
  },
  {
    bg: 'rgba(236, 72, 153, 0.2)',
    border: 'rgb(236, 72, 153)',
    text: 'rgb(219, 39, 119)',
  },
  {
    bg: 'rgba(20, 184, 166, 0.2)',
    border: 'rgb(20, 184, 166)',
    text: 'rgb(13, 148, 136)',
  },
  {
    bg: 'rgba(249, 115, 22, 0.2)',
    border: 'rgb(249, 115, 22)',
    text: 'rgb(234, 88, 12)',
  },
  {
    bg: 'rgba(99, 102, 241, 0.2)',
    border: 'rgb(99, 102, 241)',
    text: 'rgb(79, 70, 229)',
  },
  {
    bg: 'rgba(34, 197, 94, 0.2)',
    border: 'rgb(34, 197, 94)',
    text: 'rgb(22, 163, 74)',
  },
];

function getColorByIndex(index: number) {
  return APPOINTMENT_COLORS[index % APPOINTMENT_COLORS.length];
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const MONTHS = [
  { value: 0, label: 'Ocak' },
  { value: 1, label: 'Şubat' },
  { value: 2, label: 'Mart' },
  { value: 3, label: 'Nisan' },
  { value: 4, label: 'Mayıs' },
  { value: 5, label: 'Haziran' },
  { value: 6, label: 'Temmuz' },
  { value: 7, label: 'Ağustos' },
  { value: 8, label: 'Eylül' },
  { value: 9, label: 'Ekim' },
  { value: 10, label: 'Kasım' },
  { value: 11, label: 'Aralık' },
];

interface CalendarViewProps {
  appointments: CalendarAppointment[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function CalendarView({
  appointments,
  currentDate,
  onDateChange,
}: CalendarViewProps) {
  const { setOpen, setSelectedDate, setSelectedAppointments } = useCalendar();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();

    appointments.forEach((appointment) => {
      const travelInfo = appointment.travel_info[0];
      if (travelInfo?.appointment_date) {
        const dateKey = format(
          new Date(travelInfo.appointment_date),
          'yyyy-MM-dd'
        );
        const existing = map.get(dateKey) || [];
        map.set(dateKey, [...existing, appointment]);
      }
    });

    map.forEach((appointments, key) => {
      const sorted = [...appointments].sort((a, b) => {
        const timeA = a.travel_info[0]?.appointment_time || '99:99';
        const timeB = b.travel_info[0]?.appointment_time || '99:99';
        return timeA.localeCompare(timeB);
      });
      map.set(key, sorted);
    });

    return map;
  }, [appointments]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  }, []);

  const handlePrevMonth = useCallback(() => {
    onDateChange(subMonths(currentDate, 1));
  }, [currentDate, onDateChange]);

  const handleNextMonth = useCallback(() => {
    onDateChange(addMonths(currentDate, 1));
  }, [currentDate, onDateChange]);

  const handleMonthChange = useCallback(
    (value: string) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(parseInt(value));
      onDateChange(newDate);
    },
    [currentDate, onDateChange]
  );

  const handleYearChange = useCallback(
    (value: string) => {
      const newDate = new Date(currentDate);
      newDate.setFullYear(parseInt(value));
      onDateChange(newDate);
    },
    [currentDate, onDateChange]
  );

  const getAppointmentsForDate = useCallback(
    (date: Date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return appointmentsByDate.get(dateKey) || [];
    },
    [appointmentsByDate]
  );

  const handleDayClick = useCallback(
    (day: Date) => {
      const dayAppointments = getAppointmentsForDate(day);
      setSelectedDate(day);
      setSelectedAppointments(dayAppointments);
      setOpen('day-detail');
    },
    [getAppointmentsForDate, setSelectedDate, setSelectedAppointments, setOpen]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="ml-2 text-xl font-semibold capitalize sm:text-2xl">
            {format(currentDate, 'MMMM yyyy', { locale: tr })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={currentDate.getMonth().toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-28 sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentDate.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-20 sm:w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="hidden sm:inline-flex"
          >
            Bugün
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
        <div className="bg-muted/50 grid grid-cols-7 border-b">
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              className={cn(
                'text-muted-foreground px-1 py-2 text-center text-xs font-medium sm:px-2 sm:text-sm',
                index < 6 && 'border-r'
              )}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid flex-1 auto-rows-fr grid-cols-7">
          {calendarDays.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const dayOfWeek = getDay(day);
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const rowIndex = Math.floor(dayIndex / 7);
            const totalRows = Math.ceil(calendarDays.length / 7);
            const isLastRow = rowIndex === totalRows - 1;
            const isLastColumn = dayIndex % 7 === 6;

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'group hover:bg-accent/50 relative flex min-h-[100px] cursor-pointer flex-col overflow-hidden p-1 transition-colors sm:min-h-[120px] sm:p-1.5',
                  !isLastColumn && 'border-r',
                  !isLastRow && 'border-b',
                  !isCurrentMonth && 'bg-muted/30',
                  isWeekend && isCurrentMonth && 'bg-muted/20'
                )}
              >
                <div
                  className={cn(
                    'mb-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium sm:mb-1 sm:h-7 sm:w-7 sm:text-sm',
                    !isCurrentMonth && 'text-muted-foreground/50',
                    isCurrentDay && 'bg-primary text-primary-foreground',
                    !isCurrentDay && isCurrentMonth && 'group-hover:bg-accent'
                  )}
                >
                  {format(day, 'd')}
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                  {dayAppointments.slice(0, 3).map((appointment, index) => {
                    const travelInfo = appointment.travel_info[0];
                    const color = getColorByIndex(index);

                    return (
                      <div
                        key={appointment.id}
                        className="flex min-h-[18px] items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] leading-tight sm:min-h-[22px] sm:gap-1.5 sm:px-1.5 sm:py-1 sm:text-xs"
                        style={{
                          backgroundColor: color.bg,
                          borderLeft: `2px solid ${color.border}`,
                          color: color.text,
                        }}
                        title={`${appointment.name}${travelInfo?.appointment_time ? ` - ${travelInfo.appointment_time}` : ''}`}
                      >
                        {travelInfo?.appointment_time && (
                          <Clock className="hidden h-2.5 w-2.5 shrink-0 sm:block" />
                        )}
                        <span className="truncate font-medium">
                          <span className="hidden sm:inline">
                            {travelInfo?.appointment_time &&
                              `${travelInfo.appointment_time} `}
                          </span>
                          {appointment.name}
                        </span>
                      </div>
                    );
                  })}

                  {dayAppointments.length > 3 && (
                    <div className="text-muted-foreground mt-auto px-1 text-[10px] font-medium sm:text-xs">
                      +{dayAppointments.length - 3} daha
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
