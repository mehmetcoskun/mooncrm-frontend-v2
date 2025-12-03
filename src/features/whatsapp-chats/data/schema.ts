import { z } from 'zod';

export const whatsappChatSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  picture: z.string().optional(),
  lastMessage: z
    .object({
      body: z.string().optional(),
      fromMe: z.boolean().optional(),
      ackName: z.enum(['SERVER', 'DEVICE', 'READ']).optional(),
    })
    .optional(),
});
export type WhatsappChat = z.infer<typeof whatsappChatSchema>;

export const whatsappChatListSchema = z.array(whatsappChatSchema);

export const whatsappMessageMediaSchema = z.object({
  url: z.string(),
  filename: z.string().optional(),
  mimetype: z.string(),
});
export type WhatsappMessageMedia = z.infer<typeof whatsappMessageMediaSchema>;

export const whatsappMessageSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  from: z.string(),
  fromMe: z.boolean(),
  source: z.string(),
  body: z.string().optional(),
  to: z.string().nullable(),
  participant: z.string().nullable(),
  hasMedia: z.boolean(),
  media: whatsappMessageMediaSchema.nullable(),
  ack: z.number(),
  location: z.unknown().nullable(),
  vCards: z.unknown().nullable(),
  ackName: z.enum(['SERVER', 'DEVICE', 'READ']),
  replyTo: z.unknown().nullable(),
  _data: z.unknown(),
});
export type WhatsappMessage = z.infer<typeof whatsappMessageSchema>;

export const whatsappMessageListSchema = z.array(whatsappMessageSchema);
