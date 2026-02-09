import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { type WorkSchedule } from '@/features/users/data/schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workSchedule: WorkSchedule;
  onWorkScheduleChange: (workSchedule: WorkSchedule) => void;
}

const dayNames = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

export function WorkScheduleSidebar({
  open,
  onOpenChange,
  workSchedule,
  onWorkScheduleChange,
}: Props) {
  const [selectedDayToCopy, setSelectedDayToCopy] = useState<number | null>(
    null
  );
  const [selectedDaysToPaste, setSelectedDaysToPaste] = useState<number[]>([]);
  const [copyPopoverOpen, setCopyPopoverOpen] = useState<
    Record<number, boolean>
  >({});

  const handleAddTimeSlot = (dayIndex: number) => {
    const currentDay = workSchedule.days[dayIndex];
    if (currentDay.times.length > 0) {
      const lastTimeSlot = currentDay.times[currentDay.times.length - 1];
      if (
        !lastTimeSlot.start ||
        !lastTimeSlot.end ||
        lastTimeSlot.start.trim() === '' ||
        lastTimeSlot.end.trim() === ''
      ) {
        toast.error('Uyarı', {
          description: 'Lütfen önce mevcut saat aralığını doldurun.',
        });
        return;
      }
    }

    const newWorkSchedule = { ...workSchedule };
    newWorkSchedule.days[dayIndex].times.push({ start: '', end: '' });
    onWorkScheduleChange(newWorkSchedule);
  };

  const handleRemoveTimeSlot = (dayIndex: number, timeIndex: number) => {
    const newWorkSchedule = { ...workSchedule };
    newWorkSchedule.days[dayIndex].times.splice(timeIndex, 1);
    onWorkScheduleChange(newWorkSchedule);
  };

  const handleTimeChange = (
    dayIndex: number,
    timeIndex: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const newWorkSchedule = { ...workSchedule };
    const timeValue = value ? value.split(':').slice(0, 2).join(':') : '';

    if (
      field === 'start' &&
      timeValue &&
      newWorkSchedule.days[dayIndex].times[timeIndex].end
    ) {
      if (timeValue >= newWorkSchedule.days[dayIndex].times[timeIndex].end) {
        toast.error('Uyarı', {
          description: 'Başlangıç saati, bitiş saatinden büyük olamaz.',
        });
        return;
      }
    }

    if (
      field === 'end' &&
      timeValue &&
      newWorkSchedule.days[dayIndex].times[timeIndex].start
    ) {
      if (timeValue <= newWorkSchedule.days[dayIndex].times[timeIndex].start) {
        toast.error('Uyarı', {
          description: 'Bitiş saati, başlangıç saatinden küçük olamaz.',
        });
        return;
      }
    }

    newWorkSchedule.days[dayIndex].times[timeIndex][field] = timeValue;
    onWorkScheduleChange(newWorkSchedule);
  };

  const handleCopySchedule = (dayIndex: number) => {
    const selectedDay = workSchedule.days[dayIndex].day;
    setSelectedDayToCopy(selectedDay);
    setSelectedDaysToPaste([selectedDay]);
    setCopyPopoverOpen((prev) => ({ ...prev, [selectedDay]: true }));
  };

  const handlePasteSchedule = () => {
    if (selectedDayToCopy === null || selectedDaysToPaste.length <= 1) return;

    const sourceDaySchedule =
      workSchedule.days.find((day) => day.day === selectedDayToCopy)?.times ||
      [];

    const newWorkSchedule = { ...workSchedule };

    selectedDaysToPaste
      .filter((targetDay) => targetDay !== selectedDayToCopy)
      .forEach((targetDay) => {
        const targetDayIndex = newWorkSchedule.days.findIndex(
          (day) => day.day === targetDay
        );
        if (targetDayIndex !== -1) {
          newWorkSchedule.days[targetDayIndex].times = sourceDaySchedule.map(
            (time) => ({ ...time })
          );
        }
      });

    onWorkScheduleChange(newWorkSchedule);
    setCopyPopoverOpen({});
    setSelectedDayToCopy(null);
    setSelectedDaysToPaste([]);

    toast.success('Başarılı', {
      description: 'Mesai saatleri kopyalandı',
    });
  };

  useEffect(() => {
    if (!workSchedule.days || workSchedule.days.length === 0) {
      const defaultWorkSchedule = {
        is_active: workSchedule.is_active,
        days: [
          { day: 0, times: [] },
          { day: 1, times: [] },
          { day: 2, times: [] },
          { day: 3, times: [] },
          { day: 4, times: [] },
          { day: 5, times: [] },
          { day: 6, times: [] },
        ],
      };
      onWorkScheduleChange(defaultWorkSchedule);
    }
  }, [workSchedule, onWorkScheduleChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Mesai Saatleri Yönetimi
          </SheetTitle>
          <SheetDescription>
            Kullanıcının çalışma saatlerini buradan düzenleyebilirsiniz.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {workSchedule.days.map((day, dayIndex) => (
            <div key={day.day} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-lg font-medium">
                    {dayNames[day.day]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {day.times.length > 0 && (
                    <Popover
                      open={copyPopoverOpen[day.day] || false}
                      onOpenChange={(open) =>
                        setCopyPopoverOpen((prev) => ({
                          ...prev,
                          [day.day]: open,
                        }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopySchedule(dayIndex)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Saatleri Kopyala</h4>
                            <p className="text-muted-foreground text-sm">
                              {dayNames[selectedDayToCopy || 0]} gününün
                              saatlerini seçtiğiniz günlere kopyalayabilirsiniz.
                            </p>
                          </div>
                          <div className="space-y-2">
                            {workSchedule.days.map((d) => (
                              <div
                                key={d.day}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`day-${d.day}`}
                                  checked={selectedDaysToPaste.includes(d.day)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedDaysToPaste([
                                        ...selectedDaysToPaste,
                                        d.day,
                                      ]);
                                    } else {
                                      setSelectedDaysToPaste(
                                        selectedDaysToPaste.filter(
                                          (dayNum) => dayNum !== d.day
                                        )
                                      );
                                    }
                                  }}
                                  disabled={d.day === selectedDayToCopy}
                                />
                                <Label
                                  htmlFor={`day-${d.day}`}
                                  className={
                                    d.day === selectedDayToCopy
                                      ? 'opacity-50'
                                      : ''
                                  }
                                >
                                  {dayNames[d.day]}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={handlePasteSchedule}
                            disabled={selectedDaysToPaste.length <= 1}
                            className="w-full"
                          >
                            Kopyala
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTimeSlot(dayIndex)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {day.times.length === 0 ? (
                <div className="bg-muted flex items-center justify-center rounded-md p-4">
                  <span className="text-muted-foreground">
                    Bu gün için mesai saati tanımlanmamış
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {day.times.map((time, timeIndex) => (
                    <div
                      key={timeIndex}
                      className="bg-muted flex items-center gap-2 rounded-md p-2"
                    >
                      <div className="flex-1">
                        <Input
                          type="time"
                          value={time.start}
                          onChange={(e) =>
                            handleTimeChange(
                              dayIndex,
                              timeIndex,
                              'start',
                              e.target.value
                            )
                          }
                          placeholder="Başlangıç"
                        />
                      </div>
                      <span className="text-muted-foreground">-</span>
                      <div className="flex-1">
                        <Input
                          type="time"
                          value={time.end}
                          onChange={(e) =>
                            handleTimeChange(
                              dayIndex,
                              timeIndex,
                              'end',
                              e.target.value
                            )
                          }
                          placeholder="Bitiş"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleRemoveTimeSlot(dayIndex, timeIndex)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
