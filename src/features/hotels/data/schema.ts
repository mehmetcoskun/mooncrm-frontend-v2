import { z } from 'zod';

const messageTemplatesSchema = z.object({
  sale: z.string(),
  cancel: z.string(),
}).nullable();

export const hotelSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  chat_id: z.string().nullable(),
  message_templates: messageTemplatesSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Hotel = z.infer<typeof hotelSchema>;

export const hotelListSchema = z.array(hotelSchema);
