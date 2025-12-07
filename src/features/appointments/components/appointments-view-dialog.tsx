'use client';

import { format, parse, subHours } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Calendar,
  Plane,
  Hotel,
  User,
  MapPin,
  UserCheck,
  Users,
  Mail,
  Phone,
  Bus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { type ToothTreatment } from '@/features/customers/data/schema';
import { type Appointment } from '../data/schema';

interface AppointmentsViewDialogProps {
  currentRow?: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentsViewDialog({
  currentRow,
  open,
  onOpenChange,
}: AppointmentsViewDialogProps) {
  if (!currentRow) return null;

  const travelInfo = currentRow.travel_info[0];
  const pickupTime = travelInfo
    ? subHours(
        parse(
          `${travelInfo.departure_date} ${travelInfo.departure_time}`,
          'yyyy-MM-dd HH:mm',
          new Date()
        ),
        3
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Randevu Detayları</span>
          </DialogTitle>
          <DialogDescription>Randevu ID: #{currentRow.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Müşteri Bilgileri */}
          <div>
            <h3 className="mb-3 flex items-center text-lg font-semibold">
              <Users className="mr-2 h-4 w-4" />
              Müşteri Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">{currentRow.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="text-muted-foreground h-4 w-4" />
                <span>{currentRow.phone}</span>
              </div>
              {currentRow.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span>{currentRow.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {currentRow.travel_count}. Seyahat
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Danışman Bilgileri */}
          <div>
            <h3 className="mb-3 flex items-center text-lg font-semibold">
              <UserCheck className="mr-2 h-4 w-4" />
              Danışman
            </h3>
            <div className="flex items-center space-x-2">
              <UserCheck className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">{currentRow.user.name}</span>
            </div>
          </div>

          <Separator />

          {/* Hizmetler */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Hizmetler</h3>
            <div className="flex flex-wrap gap-2">
              {currentRow.services.map((service) => (
                <Badge key={service.id} variant="outline">
                  {service.title}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Randevu Bilgileri */}
          {travelInfo && (
            <div>
              <h3 className="mb-3 flex items-center text-lg font-semibold">
                <Calendar className="mr-2 h-4 w-4" />
                Randevu Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Randevu Tarihi
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span>
                      {format(
                        new Date(travelInfo.appointment_date),
                        'dd MMMM yyyy',
                        { locale: tr }
                      )}{' '}
                      - {travelInfo.appointment_time}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Doktor
                  </label>
                  <div className="mt-1">
                    <span>{travelInfo.doctor?.name || '-'}</span>
                  </div>
                </div>
                {travelInfo.teeth && travelInfo.teeth.length > 0 && (
                  <div className="col-span-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Tedavi Planı
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {travelInfo.teeth.map((tooth: ToothTreatment) => (
                        <Badge
                          key={tooth.tooth_number}
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          <span className="font-semibold">
                            {tooth.tooth_number}
                          </span>
                          {tooth.treatment && (
                            <>
                              <span className="text-muted-foreground">-</span>
                              <span>{tooth.treatment}</span>
                            </>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Seyahat Bilgileri */}
          {travelInfo && (
            <div>
              <h3 className="mb-3 flex items-center text-lg font-semibold">
                <Plane className="mr-2 h-4 w-4" />
                Seyahat Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Geliş */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Geliş</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Tarih:
                      </span>{' '}
                      {format(
                        new Date(travelInfo.arrival_date),
                        'dd MMMM yyyy',
                        { locale: tr }
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Saat:
                      </span>{' '}
                      {travelInfo.arrival_time}
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Uçuş:
                      </span>{' '}
                      {travelInfo.arrival_flight_code}
                    </div>
                  </div>
                </div>

                {/* Gidiş */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Gidiş</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Tarih:
                      </span>{' '}
                      {format(
                        new Date(travelInfo.departure_date),
                        'dd MMMM yyyy',
                        { locale: tr }
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Saat:
                      </span>{' '}
                      {travelInfo.departure_time}
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Uçuş:
                      </span>{' '}
                      {travelInfo.departure_flight_code}
                    </div>
                    {pickupTime && (
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Alınma Saati (3 saat öncesi):
                        </span>{' '}
                        <Badge variant="secondary">
                          {format(pickupTime, 'HH:mm', { locale: tr })}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Konaklama Bilgileri */}
          {travelInfo && (
            <div>
              <h3 className="mb-3 flex items-center text-lg font-semibold">
                <Hotel className="mr-2 h-4 w-4" />
                Konaklama Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Otel
                  </label>
                  <div className="mt-1">
                    <span>
                      {travelInfo.hotel?.name ||
                        travelInfo.hotel_name ||
                        'Özel Otel'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Oda Tipi
                  </label>
                  <div className="mt-1">
                    <span>{travelInfo.room_type}</span>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Kişi Sayısı
                  </label>
                  <div className="mt-1">
                    <span>{travelInfo.person_count}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Transfer Bilgileri */}
          {travelInfo && (
            <div>
              <h3 className="mb-3 flex items-center text-lg font-semibold">
                <Bus className="mr-2 h-4 w-4" />
                Transfer Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Transfer Şirketi
                  </label>
                  <div className="mt-1">
                    <span>
                      {travelInfo.transfer?.name ||
                        travelInfo.transfer_name ||
                        'Özel Transfer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Notlar */}
          {travelInfo?.notes && (
            <div>
              <h3 className="mb-3 flex items-center text-lg font-semibold">
                <MapPin className="mr-2 h-4 w-4" />
                Notlar
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {travelInfo.notes}
                </p>
              </div>
            </div>
          )}

          {/* Sağlık Notları */}
          {currentRow.sales_info?.health_notes && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Sağlık Notları</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {currentRow.sales_info.health_notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
