export type ReportType = 'lost' | 'found';

export const TARGET_CATEGORIES = [
  'Electronics',
  'Clothing',
  'IDs & Wallets',
  'Books & Stationery',
  'Keys',
  'Accessories',
  'Miscellaneous'
] as const;

export type TargetCategory = (typeof TARGET_CATEGORIES)[number];

export interface Item {
  id: string;
  report_type: ReportType;
  category: TargetCategory | string;
  title: string;
  description: string;
  image_url: string;
  location: string;
  event_time: string;
  contact_info: string;
  status: 'active' | 'resolved';
  created_at: string;
}

export interface ItemMatch {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  confidence_score: number;
  explanation: string;
  created_at: string;
  matched_item: Item;
}

export interface ItemDetailResponse {
  item: Item;
  matches_count: number;
  matches: ItemMatch[];
}

export interface DashboardStats {
  totalItems: number;
  lostItems: number;
  foundItems: number;
  resolvedItems: number;
  totalMatches: number;
  highConfidenceMatches: number;
}

export interface ItemFormData {
  report_type: ReportType;
  category: string;
  title: string;
  description: string;
  image_url: string;
  location: string;
  event_time: string;
  contact_info: string;
}
