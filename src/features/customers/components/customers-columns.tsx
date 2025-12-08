import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { updateCustomer } from '@/services/customer-service';
import { tr } from 'date-fns/locale';
import { Calendar, Hash, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTableColumnHeader } from '@/components/data-table';
import { MultiSelect } from '@/components/multi-select';
import { type Service } from '@/features/services/data/schema';
import { type Status } from '@/features/statuses/data/schema';
import { type User } from '@/features/users/data/schema';
import { type Customer } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

type ColumnsProps = {
  users: User[];
  statuses: Status[];
  services: Service[];
  refetch: () => void;
};

export function getCustomersColumns({
  users,
  statuses,
  services,
  refetch,
}: ColumnsProps): ColumnDef<Customer>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px] border-gray-300 bg-white"
        />
      ),
      meta: {
        className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px] border-gray-300 bg-white"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <div className="inline-flex items-center gap-1 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 px-2 py-1">
          <Hash className="h-3 w-3" />
          <span>{row.getValue('id')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Oluşturulma Tarihi" />
      ),
      cell: ({ row }) => {
        const customer = row.original;
        const isDuplicate =
          customer.duplicate_count > 0 && !customer.duplicate_checked;

        return (
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl border px-3 py-1',
              isDuplicate
                ? 'border-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-900 text-white'
                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'
            )}
          >
            <Calendar
              className={cn(
                'h-4 w-4 shrink-0',
                isDuplicate ? 'text-white' : 'text-gray-500'
              )}
            />
            <span className="text-sm font-medium whitespace-nowrap">
              {format(row.getValue('created_at'), 'dd MMMM yyyy HH:mm:ss', {
                locale: tr,
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'user',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Danışman" />
      ),
      cell: ({ row }) => {
        const customer = row.original;
        const user = row.getValue('user') as Customer['user'] | null;

        const handleUserChange = async (userId: string) => {
          try {
            await updateCustomer(customer.id, { user_id: Number(userId) });
            toast.success('Danışman güncellendi');
            refetch();
          } catch (_error) {
            toast.error('Danışman güncellenirken bir hata oluştu');
          }
        };

        return (
          <div className="w-full">
            <Select
              value={user?.id.toString() ?? ''}
              onValueChange={handleUserChange}
            >
              <SelectTrigger className="h-8 w-[180px] bg-white">
                <SelectValue placeholder="Danışman seçin" />
              </SelectTrigger>
              <SelectContent>
                {users
                  ?.filter((u) => u.roles.some((role) => role.id === 3))
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Müşteri Adı" />
      ),
      cell: ({ row }) => {
        return <div>{row.getValue('name')}</div>;
      },
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Telefon" />
      ),
      cell: ({ row }) => {
        const phone = row.getValue('phone') as Customer['phone'];

        const handleCopyPhone = async () => {
          if (!phone) return;

          try {
            await navigator.clipboard.writeText(phone);
            toast.success('Telefon numarası kopyalandı');
          } catch (_error) {
            toast.error('Telefon numarası kopyalanırken bir hata oluştu');
          }
        };

        if (!phone || phone.length <= 6) {
          return (
            <div
              onClick={handleCopyPhone}
              className="hover:text-primary flex cursor-pointer items-center gap-2"
            >
              <span>{phone || ''}</span>
            </div>
          );
        }

        const firstPart = phone.slice(0, 3);
        const lastPart = phone.slice(-4);
        const middlePart = '*'.repeat(phone.length - 7);
        const maskedPhone = `${firstPart}${middlePart}${lastPart}`;

        return (
          <div
            onClick={handleCopyPhone}
            className="hover:text-primary flex cursor-pointer items-center gap-2"
            title="Kopyalamak için tıklayın"
          >
            <span>{maskedPhone}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kategori" />
      ),
      cell: ({ row }) => {
        const category = row.getValue('category') as Customer['category'];
        return (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-1">
            <Tag className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">
              {category?.title}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Durum" />
      ),
      cell: ({ row }) => {
        const customer = row.original;
        const status = row.getValue('status') as Customer['status'] | null;

        const handleStatusChange = async (statusId: string) => {
          try {
            await updateCustomer(customer.id, { status_id: Number(statusId) });
            toast.success('Durum güncellendi');
            refetch();
          } catch (_error) {
            toast.error('Durum güncellenirken bir hata oluştu');
          }
        };

        return (
          <div className="w-full">
            <Select
              value={status?.id.toString() ?? ''}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-8 w-[180px] bg-white">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                {statuses?.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accessorKey: 'services',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hizmetler" />
      ),
      cell: ({ row }) => {
        const customer = row.original;

        const handleServicesChange = async (values: string[]) => {
          try {
            await updateCustomer(customer.id, {
              service_ids: values.map(Number),
            });
            toast.success('Hizmetler güncellendi');
          } catch (_error) {
            toast.error('Hizmetler güncellenirken bir hata oluştu');
          }
        };

        const serviceOptions =
          services?.map((service) => ({
            label: service.title,
            value: service.id.toString(),
          })) || [];

        const selectedServices =
          customer.services?.map((s) => s.id.toString()) || [];

        return (
          <div className="w-full">
            <MultiSelect
              options={serviceOptions}
              defaultValue={selectedServices}
              onValueChange={handleServicesChange}
              placeholder="Hizmet seçin"
              maxCount={1}
            />
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: DataTableRowActions,
    },
  ];
}
