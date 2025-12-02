import { z } from 'zod';

const appointmentSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  reminder: z.any().nullable(),
  sales_info: z.any(),
  travel_info: z.array(z.any()),
  travel_count: z.number(),
  total_travels: z.number(),
  user: z.any(),
  services: z.array(z.any()),
});
export type Appointment = z.infer<typeof appointmentSchema>;

export const appointmentListSchema = z.array(appointmentSchema);
