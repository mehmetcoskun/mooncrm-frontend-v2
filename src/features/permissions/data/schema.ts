import { z } from 'zod';

export const permissionSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  is_custom: z.boolean(),
  is_global: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Permission = z.infer<typeof permissionSchema>;

export const permissionListSchema = z.array(permissionSchema);
