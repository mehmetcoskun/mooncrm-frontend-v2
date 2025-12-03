import { useState } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/category-service';
import { getServices } from '@/services/service-service';
import { getStatuses } from '@/services/status-service';
import { getUsers } from '@/services/user-service';
import { countries } from 'countries-list';
import { tr } from 'date-fns/locale';
import { Filter, Plus, X, Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MultiSelect } from '@/components/multi-select';

// Operatör tipleri
type Operator = 'in' | 'nin' | 'eq' | 'between' | 'contains';

// Alan tipleri
type FieldType =
  | 'categories'
  | 'users'
  | 'statuses'
  | 'services'
  | 'countries'
  | 'trustpilot_review'
  | 'google_maps_review'
  | 'satisfaction_survey'
  | 'warranty_sent'
  | 'rpt'
  | 'created_at'
  | 'updated_at'
  | 'ad_name'
  | 'adset_name'
  | 'campaign_name';

// Filtre koşulu
export interface FilterCondition {
  id: string;
  field: FieldType | '';
  operator: Operator | '';
  value: string[] | string | boolean | undefined;
}

// Props
interface AdvancedFilterDialogProps {
  onApplyFilters: (
    queryString: string,
    filters: FilterCondition[],
    logicalOp: 'and' | 'or',
    queryParams: Record<string, unknown>
  ) => void;
  initialFilters?: FilterCondition[];
  initialLogicalOperator?: 'and' | 'or';
  activeFilterCount?: number;
}

// Alan yapılandırması
const FIELD_CONFIG: Record<
  FieldType,
  {
    label: string;
    operators: Operator[];
    type: 'multi-select' | 'boolean' | 'date' | 'text';
  }
> = {
  categories: {
    label: 'Kategoriler',
    operators: ['in', 'nin'],
    type: 'multi-select',
  },
  users: {
    label: 'Danışmanlar',
    operators: ['in', 'nin'],
    type: 'multi-select',
  },
  statuses: {
    label: 'Durumlar',
    operators: ['in', 'nin'],
    type: 'multi-select',
  },
  services: {
    label: 'Hizmetler',
    operators: ['in', 'nin'],
    type: 'multi-select',
  },
  countries: {
    label: 'Ülkeler',
    operators: ['in', 'nin'],
    type: 'multi-select',
  },
  trustpilot_review: {
    label: 'Trustpilot İncelemesi',
    operators: ['eq'],
    type: 'boolean',
  },
  google_maps_review: {
    label: 'Google Maps İncelemesi',
    operators: ['eq'],
    type: 'boolean',
  },
  satisfaction_survey: {
    label: 'Memnuniyet Anketi',
    operators: ['eq'],
    type: 'boolean',
  },
  warranty_sent: {
    label: 'Garanti Gönderildi',
    operators: ['eq'],
    type: 'boolean',
  },
  rpt: { label: 'RPT', operators: ['eq'], type: 'boolean' },
  ad_name: {
    label: 'Reklam Adı',
    operators: ['contains'],
    type: 'text',
  },
  adset_name: {
    label: 'Reklam Seti Adı',
    operators: ['contains'],
    type: 'text',
  },
  campaign_name: {
    label: 'Kampanya Adı',
    operators: ['contains'],
    type: 'text',
  },
  created_at: {
    label: 'Kayıt Tarihi',
    operators: ['eq', 'between'],
    type: 'date',
  },
  updated_at: {
    label: 'Düzenleme Tarihi',
    operators: ['eq', 'between'],
    type: 'date',
  },
};

// Operatör etiketleri
const OPERATOR_LABELS: Record<Operator, string> = {
  in: 'İçinde',
  nin: 'İçinde Değil',
  eq: 'Eşittir',
  between: 'Arasında',
  contains: 'İçerir',
};

// Filtre satırı bileşeni
function FilterRow({
  filter,
  onUpdate,
  onRemove,
}: {
  filter: FilterCondition;
  onUpdate: (id: string, updates: Partial<FilterCondition>) => void;
  onRemove: (id: string) => void;
}) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: filter.field === 'categories',
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: filter.field === 'users',
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: getStatuses,
    enabled: filter.field === 'statuses',
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
    enabled: filter.field === 'services',
  });

  const countryOptions = Object.entries(countries).map(([code, country]) => ({
    label: country.name,
    value: code,
  }));

  const fieldConfig = filter.field ? FIELD_CONFIG[filter.field] : null;
  const availableOperators = fieldConfig?.operators || [];

  const getValueOptions = () => {
    if (!filter.field) return [];

    switch (filter.field) {
      case 'categories':
        return categories.map((cat: { id: number; title: string }) => ({
          label: cat.title,
          value: String(cat.id),
        }));
      case 'users':
        return users.map((user: { id: number; name: string }) => ({
          label: user.name,
          value: String(user.id),
        }));
      case 'statuses':
        return statuses.map((status: { id: number; title: string }) => ({
          label: status.title,
          value: String(status.id),
        }));
      case 'services':
        return services.map((service: { id: number; title: string }) => ({
          label: service.title,
          value: String(service.id),
        }));
      case 'countries':
        return countryOptions;
      default:
        return [];
    }
  };

  const renderValueInput = () => {
    const isDisabled = !filter.field || !filter.operator;

    if (!filter.field) {
      return (
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Değer" />
          </SelectTrigger>
        </Select>
      );
    }

    const config = FIELD_CONFIG[filter.field];

    if (config.type === 'multi-select') {
      const options = getValueOptions();
      return (
        <MultiSelect
          options={options}
          defaultValue={Array.isArray(filter.value) ? filter.value : []}
          onValueChange={(values) => onUpdate(filter.id, { value: values })}
          placeholder="Değer seçin"
          className="w-full"
          disabled={isDisabled}
        />
      );
    }

    if (config.type === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={filter.value === true}
            onCheckedChange={(checked) =>
              onUpdate(filter.id, { value: checked })
            }
            disabled={isDisabled}
          />
          <Label>{filter.value === true ? 'Evet' : 'Hayır'}</Label>
        </div>
      );
    }

    if (config.type === 'date') {
      if (filter.operator === 'between') {
        // Tarih aralığı için mode="range" kullan
        const dateRange = Array.isArray(filter.value) ? filter.value : ['', ''];
        const rangeValue: DateRange | undefined =
          dateRange[0] && dateRange[1]
            ? {
                from: new Date(dateRange[0]),
                to: new Date(dateRange[1]),
              }
            : dateRange[0]
              ? { from: new Date(dateRange[0]), to: undefined }
              : undefined;

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!rangeValue?.from}
                className="data-[empty=true]:text-muted-foreground w-full justify-start text-start font-normal"
                disabled={isDisabled}
              >
                {rangeValue?.from ? (
                  rangeValue.to ? (
                    <>
                      {format(rangeValue.from, 'MMM d, yyyy', { locale: tr })} -{' '}
                      {format(rangeValue.to, 'MMM d, yyyy', { locale: tr })}
                    </>
                  ) : (
                    format(rangeValue.from, 'MMM d, yyyy', { locale: tr })
                  )
                ) : (
                  <span>Tarih aralığı seçin</span>
                )}
                <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                captionLayout="dropdown"
                selected={rangeValue}
                onSelect={(range: DateRange | undefined) => {
                  if (range?.from) {
                    const newRange = [
                      format(range.from, 'yyyy-MM-dd', { locale: tr }),
                      range.to
                        ? format(range.to, 'yyyy-MM-dd', { locale: tr })
                        : '',
                    ];
                    onUpdate(filter.id, { value: newRange });
                  } else {
                    onUpdate(filter.id, { value: ['', ''] });
                  }
                }}
                disabled={(date: Date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        );
      } else {
        // Tekli tarih için mode="single" kullan
        const selectedDate =
          typeof filter.value === 'string' && filter.value
            ? new Date(filter.value)
            : undefined;

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!selectedDate}
                className="data-[empty=true]:text-muted-foreground w-full justify-start text-start font-normal"
                disabled={isDisabled}
              >
                {selectedDate ? (
                  format(selectedDate, 'MMM d, yyyy', { locale: tr })
                ) : (
                  <span>Tarih seçin</span>
                )}
                <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={selectedDate}
                onSelect={(date: Date | undefined) =>
                  onUpdate(filter.id, {
                    value: date
                      ? format(date, 'yyyy-MM-dd', { locale: tr })
                      : '',
                  })
                }
                disabled={(date: Date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
              />
            </PopoverContent>
          </Popover>
        );
      }
    }

    if (config.type === 'text') {
      return (
        <Input
          type="text"
          value={typeof filter.value === 'string' ? filter.value : ''}
          onChange={(e) => onUpdate(filter.id, { value: e.target.value })}
          placeholder="Değer girin"
          className="w-full"
          disabled={isDisabled}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex items-start gap-2 rounded-md border p-3">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Alan Seçimi */}
        <div className="flex-1">
          <Select
            value={filter.field}
            onValueChange={(value) => {
              onUpdate(filter.id, {
                field: value as FieldType,
                operator: '',
                value: undefined,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Alan seçin" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FIELD_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operatör Seçimi */}
        <div className="flex-1">
          <Select
            value={filter.operator}
            onValueChange={(value) =>
              onUpdate(filter.id, {
                operator: value as Operator,
                value: undefined,
              })
            }
            disabled={!filter.field}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Operatör" />
            </SelectTrigger>
            <SelectContent>
              {availableOperators.map((op) => (
                <SelectItem key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Değer Girişi */}
        <div className="flex-1">{renderValueInput()}</div>
      </div>

      {/* Silme Butonu */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(filter.id)}
        className="shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function AdvancedFilterDialog({
  onApplyFilters,
  initialFilters = [],
  initialLogicalOperator = 'and',
  activeFilterCount = 0,
}: AdvancedFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>(initialFilters);
  const [logicalOperator, setLogicalOperator] = useState<'and' | 'or'>(
    initialLogicalOperator
  );

  // Dialog açıldığında parent'tan gelen filtreleri yükle
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFilters(initialFilters.length > 0 ? [...initialFilters] : []);
      setLogicalOperator(initialLogicalOperator);
    }
    setOpen(newOpen);
  };

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      field: '',
      operator: '',
      value: undefined,
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters(
      filters.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((filter) => filter.id !== id));
  };

  const buildQueryParams = () => {
    const filterObj: Record<string, unknown> = {};

    filters.forEach((filter) => {
      if (!filter.field || !filter.operator || filter.value === undefined)
        return;

      const field = filter.field;
      const operator = filter.operator;
      const value = filter.value;

      if (FIELD_CONFIG[field].type === 'multi-select' && Array.isArray(value)) {
        filterObj[field] = value;
        filterObj[`${field}_operator`] = operator;
      } else if (FIELD_CONFIG[field].type === 'boolean') {
        filterObj[field] = value;
        filterObj[`${field}_operator`] = operator;
      } else if (FIELD_CONFIG[field].type === 'date') {
        if (operator === 'between' && Array.isArray(value)) {
          filterObj[`${field}_start`] = value[0];
          filterObj[`${field}_end`] = value[1];
          filterObj[`${field}_operator`] = operator;
        } else if (typeof value === 'string') {
          filterObj[field] = value;
          filterObj[`${field}_operator`] = operator;
        }
      } else if (FIELD_CONFIG[field].type === 'text') {
        if (typeof value === 'string' && value.trim() !== '') {
          filterObj[field] = value.trim();
          filterObj[`${field}_operator`] = operator;
        }
      }
    });

    if (Object.keys(filterObj).length > 0) {
      filterObj.logical_operator = logicalOperator;
    }

    return filterObj;
  };

  const buildQueryString = () => {
    const params: string[] = [];

    filters.forEach((filter) => {
      if (!filter.field || !filter.operator || filter.value === undefined)
        return;

      const field = filter.field;
      const operator = filter.operator;
      const value = filter.value;

      if (FIELD_CONFIG[field].type === 'multi-select' && Array.isArray(value)) {
        value.forEach((val) => {
          params.push(`${field}[]=${encodeURIComponent(val)}`);
        });
        params.push(`${field}_operator=${operator}`);
      } else if (FIELD_CONFIG[field].type === 'boolean') {
        params.push(`${field}=${value}`);
        params.push(`${field}_operator=${operator}`);
      } else if (FIELD_CONFIG[field].type === 'date') {
        if (operator === 'between' && Array.isArray(value)) {
          params.push(`${field}_start=${encodeURIComponent(value[0])}`);
          params.push(`${field}_end=${encodeURIComponent(value[1])}`);
          params.push(`${field}_operator=${operator}`);
        } else if (typeof value === 'string') {
          params.push(`${field}=${encodeURIComponent(value)}`);
          params.push(`${field}_operator=${operator}`);
        }
      } else if (FIELD_CONFIG[field].type === 'text') {
        if (typeof value === 'string' && value.trim() !== '') {
          params.push(`${field}=${encodeURIComponent(value.trim())}`);
          params.push(`${field}_operator=${operator}`);
        }
      }
    });

    if (params.length > 0) {
      params.push(`logical_operator=${logicalOperator}`);
    }

    return params.join('&');
  };

  const handleApply = () => {
    const queryString = buildQueryString();
    const queryParams = buildQueryParams();
    const validFilters = filters.filter(
      (f) => f.field && f.operator && f.value !== undefined
    );
    onApplyFilters(queryString, validFilters, logicalOperator, queryParams);
    setOpen(false);
  };

  const handleReset = () => {
    setFilters([]);
    setLogicalOperator('and');
    onApplyFilters('', [], 'and', {});
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={activeFilterCount > 0 ? 'default' : 'outline'}
          size="sm"
          className="relative"
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0
            ? `Filtrele (${activeFilterCount})`
            : 'Filtrele'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gelişmiş Filtreler</DialogTitle>
          <DialogDescription>
            Verilerinizi filtrelemek için koşullar ekleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {filters.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
              <Filter className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-muted-foreground mb-2 text-lg font-medium">
                Filtre bulunamadı
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Filtreleme yapmak için bir filtre ekleyin
              </p>
              <Button variant="outline" onClick={addFilter} size="sm">
                <Plus className="h-4 w-4" />
                Filtre ekle
              </Button>
            </div>
          ) : (
            <>
              {/* Mantıksal Operatör */}
              <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">
                    Filtreler Arası Mantık
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    {logicalOperator === 'and'
                      ? 'Tüm koşullar sağlanmalı'
                      : 'En az bir koşul sağlanmalı'}
                  </p>
                </div>
                <div className="bg-background flex items-center gap-2 rounded-md border p-1">
                  <Button
                    type="button"
                    variant={logicalOperator === 'and' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLogicalOperator('and')}
                    className="px-4"
                  >
                    VE
                  </Button>
                  <Button
                    type="button"
                    variant={logicalOperator === 'or' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLogicalOperator('or')}
                    className="px-4"
                  >
                    VEYA
                  </Button>
                </div>
              </div>

              {/* Filtre Satırları */}
              <div className="space-y-3">
                {filters.map((filter) => (
                  <FilterRow
                    key={filter.id}
                    filter={filter}
                    onUpdate={updateFilter}
                    onRemove={removeFilter}
                  />
                ))}
              </div>

              {/* Filtre Ekle Butonu */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFilter}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Filtre ekle
              </Button>
            </>
          )}
        </div>

        {filters.length > 0 && (
          <DialogFooter className="flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              Sıfırla
            </Button>
            <Button type="button" onClick={handleApply}>
              Filtreleri Uygula
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
