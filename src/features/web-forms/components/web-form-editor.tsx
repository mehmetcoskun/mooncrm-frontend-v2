import { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { countries } from 'countries-list';
import {
  PlusIcon,
  Trash2Icon,
  Edit2Icon,
  GripVerticalIcon,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  type Field,
  type Styles,
  type RateLimitSettings,
  type WebForm,
} from '../data/schema';
import { AddFieldDialog } from './add-field-dialog';
import { WebFormSettingsTabs } from './web-form-settings-tabs';

type WebFormEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: WebForm) => void;
  uuid: string;
  initialFields?: Field[];
  styles?: Styles;
  redirect_url?: string;
  email_recipients?: string | null;
  domain?: string;
  category_id?: number | null;
  rate_limit_settings?: RateLimitSettings;
};

export function WebFormEditor({
  open,
  onOpenChange,
  onSave,
  uuid,
  initialFields = [],
  styles = {
    containerBg: '#ffffff',
    containerBgEnabled: false,
    inputBg: '#ffffff',
    inputTextColor: '#000000',
    inputBorderColor: '#cccccc',
    labelColor: '#000000',
    buttonBgColor: '#0000ff',
    iframeBorderColor: '#cccccc',
    iframeBorderEnabled: false,
    labelFontSize: '14',
    buttonLabel: 'Gönder',
    alertMessages: {
      required: 'Lütfen tüm zorunlu alanları doldurun.',
      success: 'Form başarıyla gönderildi.',
      failure: 'Form gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.',
      invalidInput: 'Lütfen geçerli bir değer giriniz.',
      rateLimit:
        'Çok hızlı form gönderimi. Lütfen 1 dakika bekleyip tekrar deneyin.',
    },
  },
  redirect_url = '',
  email_recipients = null,
  domain = '*',
  category_id,
  rate_limit_settings = {
    enabled: true,
    maxSubmissionsPerMinute: 1,
  },
}: WebFormEditorProps) {
  const [fields, setFields] = useState<Field[]>([]);
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  const [currentStyles, setCurrentStyles] = useState(styles);
  const [currentRedirectUrl, setCurrentRedirectUrl] = useState(redirect_url);
  const [currentEmailRecipients, setCurrentEmailRecipients] =
    useState(email_recipients);
  const [currentDomain, setCurrentDomain] = useState(domain);
  const [currentCategoryId, setCurrentCategoryId] = useState(category_id);
  const [currentRateLimitSettings, setCurrentRateLimitSettings] =
    useState(rate_limit_settings);

  useEffect(() => {
    if (open) {
      setFields(initialFields);
      setCurrentStyles(styles);
      setCurrentRedirectUrl(redirect_url);
      setCurrentEmailRecipients(email_recipients);
      setCurrentDomain(domain);
      setCurrentCategoryId(category_id);
      setCurrentRateLimitSettings(rate_limit_settings);
    } else {
      setFields([]);
    }
  }, [
    open,
    initialFields,
    styles,
    redirect_url,
    email_recipients,
    domain,
    category_id,
    rate_limit_settings,
  ]);

  const handleAddField = (field: Omit<Field, 'id'>) => {
    if (editingField) {
      setFields(
        fields.map((f) =>
          f.id === editingField.id ? { ...field, id: editingField.id } : f
        )
      );
      setEditingField(null);
    } else {
      const newField: Field = {
        ...field,
        id: uuidv4(),
      };
      setFields([...fields, newField]);
    }
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setAddFieldDialogOpen(true);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);
  };

  const handleSave = () => {
    onSave({
      uuid,
      title: '',
      fields,
      styles: currentStyles,
      redirect_url: currentRedirectUrl,
      email_recipients: currentEmailRecipients,
      domain: currentDomain,
      category_id: currentCategoryId,
      rate_limit_settings: currentRateLimitSettings,
    } as WebForm);
  };

  const usedSystemFields = fields
    .filter((f) => f.systemField)
    .map((f) => f.systemField as string);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-none p-0 sm:max-w-none"
      >
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>Web Form Tasarımı</SheetTitle>
          <SheetDescription>
            Web formunuzu aşağıdaki editörde tasarlayın ve kaydedin.
          </SheetDescription>
        </SheetHeader>

        <div className="h-[calc(100vh-180px)] w-full overflow-y-auto p-6">
          <div className="flex h-full gap-6">
            <div className="w-1/2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Form Soruları</h3>
                <Button
                  onClick={() => {
                    setEditingField(null);
                    setAddFieldDialogOpen(true);
                  }}
                  size="sm"
                  variant="outline"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Yeni Soru Ekle
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="border-muted-foreground/25 flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Henüz soru eklenmedi
                    </p>
                    <Button
                      onClick={() => {
                        setEditingField(null);
                        setAddFieldDialogOpen(true);
                      }}
                      size="sm"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      İlk Soruyu Ekle
                    </Button>
                  </div>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="fields">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {fields.map((field, index) => (
                          <Draggable
                            key={field.id}
                            draggableId={field.id}
                            index={index}
                          >
                            {(
                              provided: DraggableProvided,
                              snapshot: DraggableStateSnapshot
                            ) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-card rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab pt-1 active:cursor-grabbing"
                                  >
                                    <GripVerticalIcon className="text-muted-foreground h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
                                        {index + 1}
                                      </span>
                                      <h4 className="font-medium">
                                        {field.label}
                                      </h4>
                                      {field.required && (
                                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                          Zorunlu
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                      <span>
                                        <strong>Tip:</strong>{' '}
                                        {
                                          {
                                            text: 'Metin',
                                            email: 'E-Posta',
                                            phone: 'Telefon',
                                            textarea: 'Not',
                                            number: 'Sayı',
                                            select: 'Seçim Kutusu',
                                            radio: 'Radyo Seçimi',
                                            checkbox: 'Çoklu Seçim',
                                            date: 'Tarih',
                                            'datetime-local': 'Tarih-Saat',
                                            time: 'Saat',
                                          }[field.type]
                                        }
                                      </span>
                                      <span>
                                        <strong>Genişlik:</strong> {field.width}
                                      </span>
                                      {field.defaultCountry && (
                                        <span>
                                          <strong>Varsayılan Ülke:</strong>{' '}
                                          {countries[
                                            field.defaultCountry as keyof typeof countries
                                          ]?.name || field.defaultCountry}
                                        </span>
                                      )}
                                      {field.systemField && (
                                        <span>
                                          <strong>Bağlantılı Alan:</strong>{' '}
                                          {
                                            {
                                              name: 'Ad Soyad',
                                              email: 'E-Posta',
                                              phone: 'Telefon',
                                            }[field.systemField]
                                          }
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditField(field)}
                                    >
                                      <Edit2Icon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteField(field.id)
                                      }
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            <div className="w-1/2">
              <WebFormSettingsTabs
                uuid={uuid}
                styles={currentStyles}
                onStylesChange={setCurrentStyles}
                redirect_url={currentRedirectUrl}
                onRedirectUrlChange={setCurrentRedirectUrl}
                email_recipients={currentEmailRecipients}
                onEmailRecipientsChange={setCurrentEmailRecipients}
                domain={currentDomain}
                onDomainChange={setCurrentDomain}
                category_id={currentCategoryId}
                onCategoryIdChange={setCurrentCategoryId}
                rate_limit_settings={currentRateLimitSettings}
                onRateLimitSettingsChange={setCurrentRateLimitSettings}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="sm"
          >
            İptal
          </Button>
          <Button onClick={handleSave} size="sm">
            Kaydet
          </Button>
        </SheetFooter>
      </SheetContent>

      <AddFieldDialog
        open={addFieldDialogOpen}
        onOpenChange={(open) => {
          setAddFieldDialogOpen(open);
          if (!open) {
            setEditingField(null);
          }
        }}
        onAdd={handleAddField}
        editField={editingField}
        usedSystemFields={usedSystemFields}
      />
    </Sheet>
  );
}
