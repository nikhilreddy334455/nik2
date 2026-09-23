import { Item, DashboardStats, ItemMatch } from './types.js';

export const INITIAL_MOCK_ITEMS: Item[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    report_type: 'lost',
    category: 'Miscellaneous',
    title: 'Cobalt Blue Hydro Flask 32oz',
    description: 'Dark blue wide-mouth Hydro Flask with a black straw lid. Has a distinct dent on the lower base rim and a sticker of the campus outdoor club.',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    location: 'Main University Library, 3rd Floor Study Lounge',
    event_time: new Date(Date.now() - 36 * 3600000).toISOString(),
    contact_info: 'alex.chen@university.edu',
    status: 'active',
    created_at: new Date(Date.now() - 36 * 3600000).toISOString()
  },
  {
    id: 'c9a646d3-9c61-4cb7-bfcd-ee2522c8f633',
    report_type: 'found',
    category: 'Miscellaneous',
    title: 'Blue Metal Water Bottle with Stickers',
    description: 'Found a blue insulated water flask near the computer desks. Features a silver scratch/dent near bottom edge and an outdoor club logo sticker.',
    image_url: 'https://images.unsplash.com/photo-1570831739421-9ff7738c4b4b?auto=format&fit=crop&w=800&q=80',
    location: 'Main Library 2nd Floor Commons',
    event_time: new Date(Date.now() - 30 * 3600000).toISOString(),
    contact_info: 'library-desk@university.edu',
    status: 'active',
    created_at: new Date(Date.now() - 30 * 3600000).toISOString()
  },
  {
    id: 'd8e48b8d-2917-48f8-b3d6-4e58a2d6b38c',
    report_type: 'lost',
    category: 'Electronics',
    title: 'AirPods Pro 2 in Matte Black Protective Case',
    description: 'Apple AirPods Pro 2nd Gen inside a rugged Spigen black clip case with a mini carabiner attached. Left earbud has small white scuff.',
    image_url: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80',
    location: 'Student Union Cafeteria, Booth 4',
    event_time: new Date(Date.now() - 48 * 3600000).toISOString(),
    contact_info: 'marcus.vance@university.edu',
    status: 'active',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    id: 'b12a8187-5e92-4f81-817e-9e77242187f5',
    report_type: 'found',
    category: 'Electronics',
    title: 'Wireless Earbuds with Black Rubber Case',
    description: 'Pair of Apple AirPods earbuds in a dark protective case with a metallic clip hook left on a dining table.',
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    location: 'Student Union Food Court Area',
    event_time: new Date(Date.now() - 44 * 3600000).toISOString(),
    contact_info: 'union-security@university.edu',
    status: 'active',
    created_at: new Date(Date.now() - 44 * 3600000).toISOString()
  },
  {
    id: 'a718b965-0c8a-4c28-9277-ef3d71239c81',
    report_type: 'lost',
    category: 'IDs & Wallets',
    title: 'Brown Bifold Leather Wallet with Student ID',
    description: 'Distressed brown leather Fossil wallet containing state drivers license, University student badge for Priya Patel, and campus dining card.',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    location: 'Engineering Hall, Lecture Room 105',
    event_time: new Date(Date.now() - 72 * 3600000).toISOString(),
    contact_info: 'priya.patel@eng.university.edu',
    status: 'active',
    created_at: new Date(Date.now() - 72 * 3600000).toISOString()
  },
  {
    id: '3c8e9b44-6889-4082-8419-482df759e612',
    report_type: 'found',
    category: 'IDs & Wallets',
    title: 'Men Brown Leather Wallet',
    description: 'Found leather wallet on the chair in lecture hall 105. Contains student ID card with name Priya and transit passes.',
    image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    location: 'Engineering Building Room 105',
    event_time: new Date(Date.now() - 68 * 3600000).toISOString(),
    contact_info: 'eng-lostfound@university.edu',
    status: 'active',
    created_at: new Date(Date.now() - 68 * 3600000).toISOString()
  }
];

export const INITIAL_MOCK_MATCHES: ItemMatch[] = [
  {
    id: 'm-1',
    lost_item_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    found_item_id: 'c9a646d3-9c61-4cb7-bfcd-ee2522c8f633',
    confidence_score: 94,
    explanation: 'Extremely high visual and contextual match. Both items are blue insulated water bottles with outdoor club stickers found in the University Library within 6 hours of each other.',
    created_at: new Date().toISOString(),
    matched_item: INITIAL_MOCK_ITEMS[1]
  },
  {
    id: 'm-2',
    lost_item_id: 'd8e48b8d-2917-48f8-b3d6-4e58a2d6b38c',
    found_item_id: 'b12a8187-5e92-4f81-817e-9e77242187f5',
    confidence_score: 91,
    explanation: 'Strong match on AirPods Pro inside black clip-on protective case located in the Student Union dining area around the same timeframe.',
    created_at: new Date().toISOString(),
    matched_item: INITIAL_MOCK_ITEMS[3]
  }
];

export function getMockDashboardStats(items: Item[]): DashboardStats {
  const lostItems = items.filter((i) => i.report_type === 'lost').length;
  const foundItems = items.filter((i) => i.report_type === 'found').length;
  const resolvedItems = items.filter((i) => i.status === 'resolved').length;
  return {
    totalItems: items.length,
    lostItems,
    foundItems,
    resolvedItems,
    totalMatches: INITIAL_MOCK_MATCHES.length,
    highConfidenceMatches: INITIAL_MOCK_MATCHES.filter((m) => m.confidence_score >= 80).length
  };
}
