import { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { Trash2, RefreshCw, FolderOpen, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table';
import { type Category } from '@/features/categories/data/schema';
import { type Status } from '@/features/statuses/data/schema';
import { type User } from '@/features/users/data/schema';
import { CustomersBulkCategoryDialog } from './customers-bulk-category-dialog';
import { CustomersBulkStatusDialog } from './customers-bulk-status-dialog';
import { CustomersBulkUserDialog } from './customers-bulk-user-dialog';
import { CustomersMultiDeleteDialog } from './customers-multi-delete-dialog';

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
  statuses: Status[];
  categories: Category[];
  users: User[];
  onSuccess: () => void;
};

export function DataTableBulkActions<TData>({
  table,
  statuses,
  categories,
  users,
  onSuccess,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);

  return (
    <>
      <BulkActionsToolbar table={table} entityName="müşteri">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowStatusDialog(true)}
              className="size-8"
              aria-label="Toplu durum değiştir"
              title="Toplu durum değiştir"
            >
              <RefreshCw className="size-4" />
              <span className="sr-only">Toplu durum değiştir</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toplu durum değiştir</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCategoryDialog(true)}
              className="size-8"
              aria-label="Toplu kategori değiştir"
              title="Toplu kategori değiştir"
            >
              <FolderOpen className="size-4" />
              <span className="sr-only">Toplu kategori değiştir</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toplu kategori değiştir</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowUserDialog(true)}
              className="size-8"
              aria-label="Toplu danışman değiştir"
              title="Toplu danışman değiştir"
            >
              <UserCog className="size-4" />
              <span className="sr-only">Toplu danışman değiştir</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toplu danışman değiştir</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Toplu sil"
              title="Toplu sil"
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Toplu sil</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toplu sil</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <CustomersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onSuccess}
      />

      <CustomersBulkStatusDialog
        table={table}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        statuses={statuses}
        onSuccess={onSuccess}
      />

      <CustomersBulkCategoryDialog
        table={table}
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        categories={categories}
        onSuccess={onSuccess}
      />

      <CustomersBulkUserDialog
        table={table}
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        users={users}
        onSuccess={onSuccess}
      />
    </>
  );
}
