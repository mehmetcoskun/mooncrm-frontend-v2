import { z } from 'zod';

export const fieldTypeSchema = z.enum([
  'text',
  'email',
  'phone',
  'textarea',
  'number',
  'select',
  'radio',
  'checkbox',
  'date',
  'datetime-local',
  'time',
]);

export const fieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: fieldTypeSchema,
  required: z.boolean(),
  width: z.string(),
  options: z.array(z.string()).optional(),
  systemField: z.string().optional(),
  defaultCountry: z.string().optional(),
});
export type Field = z.infer<typeof fieldSchema>;

export const alertMessagesSchema = z.object({
  required: z.string(),
  success: z.string(),
  failure: z.string(),
  invalidInput: z.string(),
  rateLimit: z.string().optional(),
});

export const stylesSchema = z.object({
  containerBg: z.string(),
  containerBgEnabled: z.boolean(),
  inputBg: z.string(),
  inputTextColor: z.string(),
  inputBorderColor: z.string(),
  labelColor: z.string(),
  buttonBgColor: z.string(),
  iframeBorderColor: z.string(),
  iframeBorderEnabled: z.boolean(),
  labelFontSize: z.string(),
  buttonLabel: z.string(),
  alertMessages: alertMessagesSchema,
});
export type Styles = z.infer<typeof stylesSchema>;

export const rateLimitSettingsSchema = z.object({
  maxSubmissionsPerMinute: z.number(),
  enabled: z.boolean(),
});
export type RateLimitSettings = z.infer<typeof rateLimitSettingsSchema>;

export const webFormSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  uuid: z.string(),
  title: z.string(),
  fields: z.array(fieldSchema),
  styles: stylesSchema,
  redirect_url: z.string().nullable(),
  email_recipients: z.string().nullable(),
  domain: z.string(),
  category_id: z.number().nullable(),
  rate_limit_settings: rateLimitSettingsSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type WebForm = z.infer<typeof webFormSchema>;

export const webFormListSchema = z.array(webFormSchema);
