import { z } from 'zod';
import { categorySchema } from '@/features/categories/data/schema';
import { organizationSchema } from '@/features/organizations/data/schema';
import { serviceSchema } from '@/features/services/data/schema';
import { statusSchema } from '@/features/statuses/data/schema';
import { userSchema } from '@/features/users/data/schema';

export const phoneCallSchema = z.object({
  date: z.string(),
  time: z.string(),
  notes: z.string(),
  is_ai_call: z.boolean().optional(),
  recording_url: z.string().optional(),
});
export type PhoneCall = z.infer<typeof phoneCallSchema>;

export const reminderSchema = z.object({
  status: z.boolean(),
  date: z.string(),
  notes: z.string(),
});
export type Reminder = z.infer<typeof reminderSchema>;

export const salesInfoSchema = z.object({
  sales_date: z.string(),
  trustpilot_review: z.boolean(),
  google_maps_review: z.boolean(),
  satisfaction_survey: z.boolean(),
  warranty_sent: z.boolean(),
  rpt: z.boolean(),
  health_notes: z.string(),
});
export type SalesInfo = z.infer<typeof salesInfoSchema>;

export const toothTreatmentSchema = z.object({
  tooth_number: z.number(),
  treatment: z.string(),
});
export type ToothTreatment = z.infer<typeof toothTreatmentSchema>;

export const travelInfoSchema = z.object({
  appointment_date: z.string(),
  appointment_time: z.string(),
  doctor_id: z.number().nullable(),
  teeth: z.array(toothTreatmentSchema).optional(),
  is_custom_hotel: z.boolean(),
  hotel_id: z.number().nullable(),
  hotel_name: z.string(),
  is_custom_transfer: z.boolean(),
  transfer_id: z.number().nullable(),
  transfer_name: z.string(),
  room_type: z.string(),
  person_count: z.string(),
  notes: z.string(),
  arrival_date: z.string(),
  arrival_time: z.string(),
  arrival_flight_code: z.string(),
  departure_date: z.string(),
  departure_time: z.string(),
  departure_flight_code: z.string(),
});
export type TravelInfo = z.infer<typeof travelInfoSchema>;

export const customerSchema = z.object({
  id: z.number(),
  organization_id: z.number(),
  user_id: z.number(),
  category_id: z.number(),
  status_id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string(),
  country: z.string().nullable(),
  notes: z.string().nullable(),
  duplicate_count: z.number(),
  duplicate_checked: z.boolean(),
  phone_calls: z.array(phoneCallSchema).nullable(),
  reminder: reminderSchema.nullable(),
  sales_info: salesInfoSchema.nullable(),
  travel_info: z.array(travelInfoSchema).nullable(),
  payment_notes: z.string().nullable(),
  ad_name: z.string().nullable(),
  adset_name: z.string().nullable(),
  campaign_name: z.string().nullable(),
  lead_form_id: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  organization: organizationSchema,
  user: userSchema,
  category: categorySchema,
  services: z.array(serviceSchema),
  status: statusSchema,
});
export type Customer = z.infer<typeof customerSchema>;
