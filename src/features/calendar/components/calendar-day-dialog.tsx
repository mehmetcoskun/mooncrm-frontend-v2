import { format } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { tr } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ChevronRight,
  Stethoscope,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type CalendarAppointment } from '../data/schema';

interface CalendarDayDialogProps {
  date: Date | null;
  appointments: CalendarAppointment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarDayDialog({
  date,
  appointments,
  open,
  onOpenChange,
}: CalendarDayDialogProps) {
  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] sm:max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">
              {format(date, 'd MMMM yyyy, EEEE', { locale: tr })}
            </span>
          </DialogTitle>
          <DialogDescription>
            {appointments.length > 0
              ? `${appointments.length} randevu bulunuyor`
              : 'Bu tarihte randevu bulunmuyor'}
          </DialogDescription>
        </DialogHeader>

        {appointments.length > 0 ? (
          <ScrollArea className="max-h-[calc(90vh-8rem)] pr-2 sm:pr-4">
            <div className="space-y-2">
              {appointments.map((appointment) => {
                const travelInfo = appointment.travel_info[0];

                return (
                  <div
                    key={appointment.id}
                    className="bg-muted/30 hover:bg-muted/50 rounded-lg border px-3 py-2.5 transition-colors sm:px-4 sm:py-3"
                  >
                    {/* Mobil Layout */}
                    <div className="flex flex-col gap-2 sm:hidden">
                      {/* Üst Kısım: Saat ve İsim */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          {travelInfo?.appointment_time && (
                            <div className="bg-primary/10 text-primary flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold">
                              <Clock className="h-3 w-3" />
                              {travelInfo.appointment_time}
                            </div>
                          )}
                          <span className="truncate text-sm font-semibold">
                            {appointment.name}
                          </span>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {appointment.travel_count}. Seyahat
                        </Badge>
                      </div>

                      {/* İletişim Bilgileri */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{appointment.phone}</span>
                        </div>

                        {travelInfo?.doctor?.name && (
                          <div className="text-muted-foreground flex items-center gap-1">
                            <Stethoscope className="h-3 w-3" />
                            <span>{travelInfo.doctor.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Hizmetler ve Detay Butonu */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                          {appointment.services.slice(0, 2).map((service) => (
                            <Badge
                              key={service.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {service.title}
                            </Badge>
                          ))}
                          {appointment.services.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{appointment.services.length - 2}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 shrink-0 px-2"
                          asChild
                        >
                          <Link
                            to={`/customers/$customerId`}
                            params={{ customerId: appointment.id.toString() }}
                          >
                            <span className="text-xs">Detay</span>
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden items-center gap-4 sm:flex">
                      {/* Saat */}
                      <div className="w-16 shrink-0 text-center">
                        {travelInfo?.appointment_time ? (
                          <div className="flex flex-col items-center">
                            <Clock className="text-muted-foreground mb-1 h-4 w-4" />
                            <span className="text-sm font-semibold">
                              {travelInfo.appointment_time}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </div>

                      {/* Dikey Çizgi */}
                      <div className="bg-border h-12 w-px shrink-0" />

                      {/* Ana İçerik */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            {/* Müşteri Adı */}
                            <div className="flex items-center gap-2">
                              <User className="text-foreground h-4 w-4 shrink-0" />
                              <span className="truncate font-semibold">
                                {appointment.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs"
                              >
                                {appointment.travel_count}. Seyahat
                              </Badge>
                            </div>

                            {/* İletişim ve Detaylar */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                              <div className="text-muted-foreground flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                <span>{appointment.phone}</span>
                              </div>

                              {appointment.email && (
                                <div className="text-muted-foreground flex items-center gap-1.5">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span className="max-w-[180px] truncate">
                                    {appointment.email}
                                  </span>
                                </div>
                              )}

                              {travelInfo?.doctor?.name && (
                                <div className="text-muted-foreground flex items-center gap-1.5">
                                  <Stethoscope className="h-3.5 w-3.5" />
                                  <span className="font-medium">
                                    {travelInfo.doctor.name}
                                  </span>
                                </div>
                              )}

                              {appointment.user?.name && (
                                <div className="text-muted-foreground flex items-center gap-1.5">
                                  <UserCheck className="h-3.5 w-3.5" />
                                  <span>{appointment.user.name}</span>
                                </div>
                              )}
                            </div>

                            {/* Hizmetler */}
                            {appointment.services.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {appointment.services
                                  .slice(0, 3)
                                  .map((service) => (
                                    <Badge
                                      key={service.id}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {service.title}
                                    </Badge>
                                  ))}
                                {appointment.services.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{appointment.services.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Detay Butonu */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 shrink-0 px-2"
                            asChild
                          >
                            <Link
                              to={`/customers/$customerId`}
                              params={{ customerId: appointment.id.toString() }}
                            >
                              <span className="text-xs">Detay</span>
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="text-muted-foreground/50 h-12 w-12" />
            <p className="text-muted-foreground mt-4 text-sm">
              Bu tarihte herhangi bir randevu bulunmuyor.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
