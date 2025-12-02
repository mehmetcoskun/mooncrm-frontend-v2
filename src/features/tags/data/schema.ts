import { z } from 'zod';
import { categorySchema } from '@/features/categories/data/schema';
import { userSchema } from '@/features/users/data/schema';

export const tagSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  title: z.string(),
  language: z.string().nullable(),
  welcome_message: z.string().nullable(),
  categories: z.array(categorySchema).optional(),
  users: z.array(userSchema).optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Tag = z.infer<typeof tagSchema>;

export const tagListSchema = z.array(tagSchema);
