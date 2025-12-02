'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSegment, updateSegment } from '@/services/segment-service';
import { languages } from 'countries-list';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AdvancedFilterDialog,
  type FilterCondition,
} from '@/components/advanced-filter-dialog';
import { type Segment } from '../data/schema';

const formSchema = z.object({
  title: z.string().min(1, 'Segment adı gereklidir.'),
  language: z.string().min(1, 'Dil seçilmelidir.'),
  filters: z
    .object({
      conditions: z.array(
        z.object({
          field: z.string(),
          operator: z.string(),
          value: z.any(),
        })
      ),
      logicalOperator: z.string(),
    })
    .optional(),
  isEdit: z.boolean(),
});
type SegmentForm = z.infer<typeof formSchema>;

type SegmentActionDialogProps = {
  currentRow?: Segment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function SegmentsActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: SegmentActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterCondition[]>([]);
  const [currentLogicalOperator, setCurrentLogicalOperator] = useState<
    'and' | 'or'
  >('and');

  const isEdit = !!currentRow;
  const form = useForm<SegmentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          language: currentRow.language,
          filters: currentRow.filters,
          isEdit,
        }
      : {
          title: '',
          language: '',
          filters: undefined,
          isEdit,
        },
  });

  // Mevcut filtreleri yükle
  useEffect(() => {
    if (currentRow?.filters?.conditions) {
      const loadedFilters: FilterCondition[] =
        currentRow.filters.conditions.map(
          (
            condition: { field: string; operator: string; value: unknown },
            index: number
          ) => ({
            id: `filter-${index}`,
            field: condition.field as FilterCondition['field'],
            operator: condition.operator as FilterCondition['operator'],
            value: condition.value as string[] | string | boolean | undefined,
          })
        );
      setCurrentFilters(loadedFilters);
      setCurrentLogicalOperator(
        currentRow.filters.logicalOperator as 'and' | 'or'
      );
    } else {
      setCurrentFilters([]);
      setCurrentLogicalOperator('and');
    }
  }, [currentRow]);

  const handleApplyFilters = (
    _queryString: string,
    filters: FilterCondition[],
    logicalOp: 'and' | 'or'
  ) => {
    setCurrentFilters(filters);
    setCurrentLogicalOperator(logicalOp);

    // Form alanını güncelle
    const filterData =
      filters.length > 0
        ? {
            conditions: filters.map((f) => ({
              field: f.field,
              operator: f.operator,
              value: f.value,
            })),
            logicalOperator: logicalOp,
          }
        : undefined;

    form.setValue('filters', filterData);
  };

  const onSubmit = async (values: SegmentForm) => {
    try {
      setIsLoading(true);

      if (isEdit && currentRow) {
        await updateSegment(currentRow.id, values);
        toast.success('Segment güncellendi', {
          description: `${values.title} segmenti başarıyla güncellendi.`,
        });
      } else {
        await createSegment(values);
        toast.success('Segment eklendi', {
          description: `${values.title} segmenti başarıyla eklendi.`,
        });
      }

      form.reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Hata', {
        description: `İşlem sırasında bir hata oluştu: ${error instanceof AxiosError ? error.response?.data.message : 'Bilinmeyen hata'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const languageOptions = Object.entries(languages).map(([code, lang]) => ({
    value: code,
    label: lang.name,
  }));

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? 'Segment Düzenle' : 'Yeni Segment Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Segmenti burada güncelleyin. '
              : 'Yeni segmenti burada oluşturun. '}
            İşlem tamamlandığında kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="segment-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Başlık</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="İlgisiz, Olumsuz, vb."
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Dil</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Dil seçiniz" />
                        </SelectTrigger>
                        <SelectContent className="max-h-96">
                          {languageOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="filters"
                render={() => (
                  <FormItem className="space-y-2">
                    <FormLabel>Filtreler</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <AdvancedFilterDialog
                          onApplyFilters={handleApplyFilters}
                          initialFilters={currentFilters}
                          initialLogicalOperator={currentLogicalOperator}
                          activeFilterCount={currentFilters.length}
                        />
                        {currentFilters.length > 0 && (
                          <p className="text-muted-foreground text-sm">
                            {currentFilters.length} filtre uygulandı
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button type="submit" form="segment-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
