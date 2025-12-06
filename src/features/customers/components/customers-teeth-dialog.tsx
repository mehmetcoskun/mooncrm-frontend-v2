'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type ToothTreatment } from '../data/schema';

type CustomersTeethDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTeeth: ToothTreatment[];
  onTeethChange: (teeth: ToothTreatment[]) => void;
};

const upperTeeth = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
];

const lowerTeeth = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

export function CustomersTeethDialog({
  open,
  onOpenChange,
  selectedTeeth,
  onTeethChange,
}: CustomersTeethDialogProps) {
  const [tempTreatments, setTempTreatments] =
    useState<ToothTreatment[]>(selectedTeeth);

  useEffect(() => {
    if (open) {
      setTempTreatments(selectedTeeth);
    }
  }, [open, selectedTeeth]);

  const isToothSelected = (toothNumber: number) => {
    return tempTreatments.some((t) => t.tooth_number === toothNumber);
  };

  const toggleTooth = (toothNumber: number) => {
    setTempTreatments((prev) => {
      if (isToothSelected(toothNumber)) {
        return prev.filter((t) => t.tooth_number !== toothNumber);
      }
      return [...prev, { tooth_number: toothNumber, treatment: '' }];
    });
  };

  const updateTreatment = (toothNumber: number, treatment: string) => {
    setTempTreatments((prev) =>
      prev.map((t) =>
        t.tooth_number === toothNumber ? { ...t, treatment } : t
      )
    );
  };

  const getTreatment = (toothNumber: number): string => {
    return (
      tempTreatments.find((t) => t.tooth_number === toothNumber)?.treatment ||
      ''
    );
  };

  const handleSave = () => {
    onTeethChange(tempTreatments);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempTreatments(selectedTeeth);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Diş Seçimi ve Tedavi Bilgileri</DialogTitle>
          <DialogDescription>
            Tedavi yapılacak dişleri seçin ve tedavi bilgisi girin. Seçilen
            dişler: {tempTreatments.length}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-8 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            <h3 className="text-center text-sm font-semibold">Üst Dişler</h3>
            <div className="flex justify-between gap-1 px-4">
              {upperTeeth.map((toothNumber) => (
                <button
                  key={toothNumber}
                  type="button"
                  onClick={() => toggleTooth(toothNumber)}
                  className={`group relative flex flex-col items-center transition-all hover:scale-105 ${
                    isToothSelected(toothNumber) ? 'opacity-100' : 'opacity-70'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={`/images/teeth/${toothNumber}.svg`}
                      alt={`Diş ${toothNumber}`}
                      className={`h-20 w-auto transition-all ${
                        isToothSelected(toothNumber)
                          ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                          : 'grayscale hover:grayscale-0'
                      }`}
                    />
                  </div>
                  <span
                    className={`mt-1 text-xs font-medium ${
                      isToothSelected(toothNumber)
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {toothNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed" />

          <div className="space-y-3">
            <h3 className="text-center text-sm font-semibold">Alt Dişler</h3>
            <div className="flex justify-between gap-1 px-4">
              {lowerTeeth.map((toothNumber) => (
                <button
                  key={toothNumber}
                  type="button"
                  onClick={() => toggleTooth(toothNumber)}
                  className={`group relative flex flex-col items-center transition-all hover:scale-105 ${
                    isToothSelected(toothNumber) ? 'opacity-100' : 'opacity-70'
                  }`}
                >
                  <span
                    className={`mb-1 text-xs font-medium ${
                      isToothSelected(toothNumber)
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {toothNumber}
                  </span>
                  <div className="relative">
                    <img
                      src={`/images/teeth/${toothNumber}.svg`}
                      alt={`Diş ${toothNumber}`}
                      className={`h-20 w-auto transition-all ${
                        isToothSelected(toothNumber)
                          ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                          : 'grayscale hover:grayscale-0'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tedavi Bilgileri */}
          {tempTreatments.length > 0 && (
            <>
              <div className="border-primary/20 border-t-2" />

              <div className="space-y-4">
                <h3 className="text-center text-lg font-semibold">
                  Tedavi Bilgileri
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tempTreatments
                    .sort((a, b) => a.tooth_number - b.tooth_number)
                    .map((tooth) => (
                      <div
                        key={tooth.tooth_number}
                        className="space-y-2 rounded-lg border p-4"
                      >
                        <Label htmlFor={`treatment_${tooth.tooth_number}`}>
                          Diş {tooth.tooth_number}
                        </Label>
                        <Input
                          id={`treatment_${tooth.tooth_number}`}
                          placeholder="Tedavi bilgisi girin..."
                          value={getTreatment(tooth.tooth_number)}
                          onChange={(e) =>
                            updateTreatment(tooth.tooth_number, e.target.value)
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-shrink-0 flex-row gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            İptal
          </Button>
          <Button type="button" onClick={handleSave}>
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
