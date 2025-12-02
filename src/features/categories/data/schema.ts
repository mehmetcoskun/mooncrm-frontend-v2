import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  parent_id: z.number().nullable(),
  title: z.string(),
  channel: z.string().nullable(),
  lead_form_id: z.string().nullable(),
  field_mappings: z.any().nullable(),
  vapi_assistant_id: z.string().nullable(),
  vapi_phone_number_id: z.string().nullable(),
  is_global: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Category = z.infer<typeof categorySchema>;

export const categoryListSchema = z.array(categorySchema);
