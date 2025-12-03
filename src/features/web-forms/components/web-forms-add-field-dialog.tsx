'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { defaultCountries } from 'react-international-phone';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { SelectDropdown } from '@/components/select-dropdown';
import { type Field } from '../data/schema';

const formSchema = z.object({
  label: z.string().min(1, 'Başlık gereklidir.'),
  type: z.string().min(1, 'Soru tipi gereklidir.'),
  required: z.boolean(),
  width: z.string().min(1, 'Genişlik gereklidir.'),
  options: z.array(z.string()).optional(),
  systemField: z.string().optional(),
  defaultCountry: z.string().optional(),
});
type FieldForm = z.infer<typeof formSchema>;

type WebFormsAddFieldDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (field: Omit<Field, 'id'>) => void;
  editField?: Field | null;
  usedSystemFields?: string[];
};

export function WebFormsAddFieldDialog({
  open,
  onOpenChange,
  onAdd,
  editField,
  usedSystemFields = [],
}: WebFormsAddFieldDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [optionInput, setOptionInput] = useState('');

  const fieldTypeOptions = [
    { value: 'text', label: 'Metin' },
    { value: 'email', label: 'E-Posta' },
    { value: 'phone', label: 'Telefon' },
    { value: 'textarea', label: 'Not' },
    { value: 'number', label: 'Sayı' },
    { value: 'select', label: 'Seçim Kutusu' },
    { value: 'radio', label: 'Radyo Seçimi' },
    { value: 'checkbox', label: 'Çoklu Seçim' },
    { value: 'date', label: 'Tarih' },
    { value: 'datetime-local', label: 'Tarih-Saat' },
    { value: 'time', label: 'Saat' },
  ];

  const systemFieldOptions = [
    { value: 'name', label: 'Ad Soyad' },
    { value: 'email', label: 'E-Posta' },
    { value: 'phone', label: 'Telefon' },
  ];

  const widthOptions = [
    { value: '50%', label: '%50' },
    { value: '100%', label: '%100' },
  ];

  const countryOptions = defaultCountries.map((country) => ({
    label: country[0],
    value: country[1],
  }));

  const isEdit = !!editField;
  const form = useForm<FieldForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          label: editField.label,
          type: editField.type,
          defaultCountry: editField.defaultCountry || '',
          systemField: editField.systemField || '',
          width: editField.width,
          options: editField.options || [],
          required: editField.required,
        }
      : {
          label: '',
          type: '',
          defaultCountry: '',
          systemField: '',
          width: '100%',
          options: [],
          required: false,
        },
  });

  const selectedType = form.watch('type');

  useEffect(() => {
    if (editField) {
      form.reset({
        label: editField.label,
        type: editField.type,
        defaultCountry: editField.defaultCountry || undefined,
        systemField: editField.systemField || '',
        width: editField.width,
        options: editField.options || [],
        required: editField.required,
      });
    } else {
      form.reset({
        label: '',
        type: '',
        defaultCountry: '',
        systemField: '',
        width: '100%',
        options: [],
        required: false,
      });
    }
  }, [editField, form]);

  const onSubmit = async (values: FieldForm) => {
    try {
      setIsLoading(true);

      const field: Omit<Field, 'id'> = {
        label: values.label,
        type: values.type as
          | 'text'
          | 'email'
          | 'phone'
          | 'textarea'
          | 'number'
          | 'select'
          | 'radio'
          | 'checkbox'
          | 'date'
          | 'datetime-local'
          | 'time',
        required: values.required,
        width: values.width,
        options:
          values.options && values.options.length > 0
            ? values.options
            : undefined,
        systemField: values.systemField || undefined,
        defaultCountry: values.defaultCountry || undefined,
      };

      onAdd(field);
      form.reset();
      setOptionInput('');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const availableSystemFields = systemFieldOptions.filter((option) => {
    if (isEdit && editField?.systemField === option.value) {
      return true;
    }
    return !usedSystemFields.includes(option.value);
  });

  const addOption = () => {
    if (optionInput.trim()) {
      const currentOptions = form.getValues('options') || [];
      form.setValue('options', [...currentOptions, optionInput.trim()]);
      setOptionInput('');
    }
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues('options') || [];
    form.setValue(
      'options',
      currentOptions.filter((_, i) => i !== index)
    );
  };

  const hasOptions = ['select', 'radio', 'checkbox'].includes(selectedType);
  const showRequired = !['radio', 'checkbox'].includes(selectedType);

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
            {isEdit ? 'Soru Düzenle' : 'Yeni Soru Ekle'}
          </DialogTitle>
          <DialogDescription>
            Form sorusunu buradan {isEdit ? 'güncelleyin' : 'ekleyin'}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-1">
          <Form {...form}>
            <form
              id="field-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Başlık</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Örn: Ad Soyad"
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
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Soru Tipi</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value || ''}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        placeholder="Soru tipi seçin"
                        items={fieldTypeOptions}
                        isControlled={true}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasOptions && (
                <div className="space-y-2">
                  <FormLabel>Seçenekler</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Seçenek ekleyin"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addOption();
                        }
                      }}
                    />
                    <Button type="button" onClick={addOption} variant="outline">
                      Ekle
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(form.watch('options') || []).map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <span className="text-sm">{option}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedType === 'phone' && (
                <FormField
                  control={form.control}
                  name="defaultCountry"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Varsayılan Ülke</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          placeholder="Ülke seçin"
                          items={countryOptions}
                          isControlled={true}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="systemField"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Bağlantılı Alan (Opsiyonel)</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value || ''}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        placeholder="Bağlantılı alan seçin"
                        items={availableSystemFields}
                        isControlled={true}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Input Genişliği</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value || '100%'}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        placeholder="Genişlik seçin"
                        items={widthOptions}
                        isControlled={true}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showRequired && (
                <FormField
                  control={form.control}
                  name="required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Zorunlu mu?</FormLabel>
                        <p className="text-muted-foreground text-sm">
                          Bu soru cevaplanması zorunlu bir soru olacak
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              )}
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
          <Button type="submit" form="field-form" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
