import { z } from 'zod';
import { organizationSchema } from '@/features/organizations/data/schema';
import { roleSchema } from '@/features/roles/data/schema';

const workScheduleSchema = z.object({
  is_active: z.boolean(),
  days: z.array(
    z.object({
      day: z.number(),
      times: z.array(z.object({ start: z.string(), end: z.string() })),
    })
  ),
});
export type WorkSchedule = z.infer<typeof workScheduleSchema>;

export const userSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  whatsapp_session_id: z.number().nullable(),
  name: z.string(),
  email: z.string(),
  email_verified_at: z.string().nullable(),
  password_changed_at: z.string().nullable(),
  work_schedule: workScheduleSchema,
  languages: z.array(z.string()),
  is_active: z.boolean(),
  two_factor_enabled: z.boolean().optional(),
  two_factor_confirmed_at: z.string().nullable().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  roles: z.array(roleSchema),
  organization: organizationSchema,
});
export type User = z.infer<typeof userSchema>;

export const userListSchema = z.array(userSchema);
