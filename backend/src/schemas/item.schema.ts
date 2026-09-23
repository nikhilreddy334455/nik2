import { z } from 'zod';

export const ALLOWED_CATEGORIES = [
  'Electronics',
  'Clothing',
  'IDs & Wallets',
  'Books & Stationery',
  'Keys',
  'Accessories',
  'Miscellaneous'
] as const;

export type ItemCategory = (typeof ALLOWED_CATEGORIES)[number];

export const ItemSchema = z.object({
  report_type: z.enum(['lost', 'found']),
  category: z.string().min(1),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  image_url: z.string().url(),
  location: z.string().min(2).max(150),
  event_time: z.string().min(1),
  contact_info: z.string().min(3)
});

export const ItemQuerySchema = z.object({
  type: z.enum(['lost', 'found']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['active', 'resolved']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0)
});

export const UpdateStatusSchema = z.object({
  status: z.enum(['active', 'resolved'])
});

export type CreateItemInput = z.infer<typeof ItemSchema>;
export type ItemQueryParams = z.infer<typeof ItemQuerySchema>;
