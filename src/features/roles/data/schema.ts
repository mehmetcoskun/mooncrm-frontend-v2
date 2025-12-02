import { z } from 'zod';
import { permissionSchema } from '@/features/permissions/data/schema';
import { statusSchema } from '@/features/statuses/data/schema';

export const roleSchema = z.object({
  id: z.number(),
  title: z.string(),
  organization_id: z.number(),
  has_status_filter: z.boolean(),
  is_global: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  statuses: z.array(statusSchema).optional(),
  permissions: z.array(permissionSchema).optional(),
});

export type Role = z.infer<typeof roleSchema>;

export const roleListSchema = z.array(roleSchema);
