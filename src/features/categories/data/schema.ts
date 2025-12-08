import { z } from 'zod';

export const fieldMappingSchema = z.object({
  field_key: z.string(),
  field_label: z.string(),
  map_to: z.string(),
});
export type FieldMapping = z.infer<typeof fieldMappingSchema>;

export const leadFormFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.string().optional(),
});
export type LeadFormField = z.infer<typeof leadFormFieldSchema>;

export const facebookLeadFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  pageName: z.string(),
  pageId: z.string(),
});
export type FacebookLeadForm = z.infer<typeof facebookLeadFormSchema>;

export const categorySchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  parent_id: z.number().nullable(),
  title: z.string(),
  channel: z.string().nullable(),
  lead_form_id: z.string().nullable(),
  field_mappings: z.array(fieldMappingSchema).nullable(),
  vapi_assistant_id: z.string().nullable(),
  vapi_phone_number_id: z.string().nullable(),
  is_global: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Category = z.infer<typeof categorySchema>;

export const categoryListSchema = z.array(categorySchema);

export const CUSTOMER_FIELDS = [
  { value: 'name', label: 'Ad Soyad' },
  { value: 'email', label: 'E-posta' },
  { value: 'phone', label: 'Telefon' },
  { value: 'notes', label: 'Notlar' },
] as const;
