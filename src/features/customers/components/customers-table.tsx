import { useState } from 'react';
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { type Category } from '@/features/categories/data/schema';
import { type Service } from '@/features/services/data/schema';
import { type Status } from '@/features/statuses/data/schema';
import { type User } from '@/features/users/data/schema';
import { type Customer } from '../data/schema';
import { getCustomersColumns } from './customers-columns';
import { DataTableBulkActions } from './data-table-bulk-actions';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className: string;
  }
}

type DataTableProps = {
  data: Customer[];
  isLoading?: boolean;
  isFetching?: boolean;
  pagination: PaginationState;
  setPagination: (
    pagination: PaginationState | ((prev: PaginationState) => PaginationState)
  ) => void;
  totalRecords: number;
  users: User[];
  statuses: Status[];
  services: Service[];
  categories: Category[];
  search: string;
  onSearchChange: (search: string) => void;
  refetch: () => void;
};

export function CustomersTable({
  data,
  isLoading = false,
  isFetching = false,
  search,
  onSearchChange,
  pagination,
  setPagination,
  totalRecords,
  users,
  statuses,
  services,
  categories,
  refetch,
}: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    updated_at: false,
    email: false,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const pageCount = Math.ceil(totalRecords / pagination.pageSize);

  const columns = getCustomersColumns({ users, statuses, services, refetch });

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnVisibility,
      globalFilter: search,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    onPaginationChange: setPagination,
    onGlobalFilterChange: onSearchChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DataTableToolbar table={table} searchPlaceholder="Ara..." />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-8 w-8"
              >
                <RefreshCw
                  className={cn('h-4 w-4', isFetching && 'animate-spin')}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Yenile</TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-muted/50 flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
          <span className="text-muted-foreground font-medium">Toplam:</span>
          <span className="font-semibold">
            {totalRecords.toLocaleString('tr-TR')}
          </span>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className ?? ''
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <span>Yükleniyor...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const customer = row.original;
                const statusColor = customer.status?.background_color + '20';

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="group/row"
                    style={
                      statusColor ? { backgroundColor: statusColor } : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                          cell.column.columnDef.meta?.className ?? ''
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableBulkActions
        table={table}
        statuses={statuses}
        categories={categories}
        users={users}
        onSuccess={refetch}
      />
    </div>
  );
}
