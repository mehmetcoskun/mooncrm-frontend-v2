import { z } from 'zod';

export const facebookLeadSchema = z.object({
  id: z.string(),
  created_time: z.string(),
  page_id: z.string(),
  page_name: z.string(),
  form_id: z.string(),
  form_name: z.string(),
  ad_id: z.string().nullable(),
  ad_name: z.string().nullable(),
  adset_id: z.string().nullable(),
  adset_name: z.string().nullable(),
  campaign_id: z.string().nullable(),
  campaign_name: z.string().nullable(),
  is_organic: z.boolean(),
  platform: z.string().nullable(),
  field_data: z.record(z.string(), z.string()),
  full_name: z.string().nullable(),
  email: z.string().nullable(),
  phone_number: z.string().nullable(),
});
export type FacebookLead = z.infer<typeof facebookLeadSchema>;
