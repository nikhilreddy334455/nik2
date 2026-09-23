export interface SeedItem {
  report_type: 'lost' | 'found';
  category: string;
  title: string;
  description: string;
  image_url: string;
  location: string;
  event_time: string;
  contact_info: string;
}

export const SEED_ITEMS: SeedItem[] = [
  // Pair 1: Hydroflask (Miscellaneous) - High Match
  {
    report_type: 'lost',
    category: 'Miscellaneous',
    title: 'Cobalt Blue Hydro Flask 32oz',
    description: 'Dark blue wide-mouth Hydro Flask with a black straw lid. Has a distinct dent on the lower base rim and a sticker of the campus outdoor club.',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    location: 'Main University Library, 3rd Floor Study Lounge',
    event_time: new Date(Date.now() - 36 * 3600000).toISOString(),
    contact_info: 'alex.chen@university.edu'
  },
  {
    report_type: 'found',
    category: 'Miscellaneous',
    title: 'Blue Metal Water Bottle with Stickers',
    description: 'Found a blue insulated water flask near the computer desks. Features a silver scratch/dent near bottom edge and an outdoor club logo sticker.',
    image_url: 'https://images.unsplash.com/photo-1570831739421-9ff7738c4b4b?auto=format&fit=crop&w=800&q=80',
    location: 'Main Library 2nd Floor Commons',
    event_time: new Date(Date.now() - 30 * 3600000).toISOString(),
    contact_info: 'library-desk@university.edu'
  },

  // Pair 2: AirPods Pro (Electronics) - High Match
  {
    report_type: 'lost',
    category: 'Electronics',
    title: 'AirPods Pro 2 in Matte Black Protective Case',
    description: 'Apple AirPods Pro 2nd Gen inside a rugged Spigen black clip case with a mini carabiner attached. Left earbud has small white scuff.',
    image_url: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80',
    location: 'Student Union Cafeteria, Booth 4',
    event_time: new Date(Date.now() - 48 * 3600000).toISOString(),
    contact_info: 'marcus.vance@university.edu'
  },
  {
    report_type: 'found',
    category: 'Electronics',
    title: 'Wireless Earbuds with Black Rubber Case',
    description: 'Pair of Apple AirPods earbuds in a dark protective case with a metallic clip hook left on a dining table.',
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    location: 'Student Union Food Court Area',
    event_time: new Date(Date.now() - 44 * 3600000).toISOString(),
    contact_info: 'union-security@university.edu'
  },

  // Pair 3: Leather Wallet & Campus ID (IDs & Wallets) - Very High Match
  {
    report_type: 'lost',
    category: 'IDs & Wallets',
    title: 'Brown Bifold Leather Wallet with Student ID',
    description: 'Distressed brown leather Timberland wallet containing University Student ID (Sarah Jenkins), blue metro card, and driver license.',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    location: 'Engineering Sciences Hall, Lecture Room 101',
    event_time: new Date(Date.now() - 24 * 3600000).toISOString(),
    contact_info: 'sarah.j@university.edu'
  },
  {
    report_type: 'found',
    category: 'IDs & Wallets',
    title: 'Found Brown Leather Wallet with Cards',
    description: 'Turned into front desk. Men/Women brown leather wallet containing university card under name Sarah J. and transit card.',
    image_url: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80',
    location: 'Engineering Building Reception Desk',
    event_time: new Date(Date.now() - 22 * 3600000).toISOString(),
    contact_info: 'eng-admin@university.edu'
  },

  // Pair 4: North Face Jacket (Clothing)
  {
    report_type: 'lost',
    category: 'Clothing',
    title: 'Black The North Face Puffer Jacket (Size M)',
    description: 'Men medium classic nuptse down black puffer. Red fleece neck warmer left inside the left zip pocket.',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    location: 'Campus Recreation Center Basketball Courts',
    event_time: new Date(Date.now() - 60 * 3600000).toISOString(),
    contact_info: 'david.kim@university.edu'
  },
  {
    report_type: 'found',
    category: 'Clothing',
    title: 'Black Winter Puffer Coat',
    description: 'Black zip-up down jacket found on bleachers near gym court 2.',
    image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
    location: 'Gymnasium Lost & Found Bin',
    event_time: new Date(Date.now() - 55 * 3600000).toISOString(),
    contact_info: 'gym-info@university.edu'
  },

  // Pair 5: Keychain (Keys)
  {
    report_type: 'lost',
    category: 'Keys',
    title: 'Dorm Key Set with Blue Spiral Lanyard & Yoshi Keychain',
    description: 'Two brass dorm keys, silver mailbox key, and a small rubber green Yoshi figurine attached to blue spiral stretchy lanyard.',
    image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
    location: 'West Quad Courtyard Benches',
    event_time: new Date(Date.now() - 18 * 3600000).toISOString(),
    contact_info: 'emily.t@university.edu'
  },
  {
    report_type: 'found',
    category: 'Keys',
    title: 'Keys with Green Character Charm',
    description: 'Set of 3 keys on a blue coiled band with a Nintendo cartoon character keychain.',
    image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    location: 'Path near Quad fountain',
    event_time: new Date(Date.now() - 16 * 3600000).toISOString(),
    contact_info: 'campus-patrol@university.edu'
  },

  // Pair 6: Organic Chemistry Textbook (Books & Stationery)
  {
    report_type: 'lost',
    category: 'Books & Stationery',
    title: 'Organic Chemistry 9th Edition Hardcover + Blue Spiral Notebook',
    description: 'Wade & Simek textbook with yellow sticky notes tabbed along chapter 6. Spiral notebook has molecular drawings.',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    location: 'Chemistry Annex Lab 304',
    event_time: new Date(Date.now() - 12 * 3600000).toISOString(),
    contact_info: 'jason.b@university.edu'
  },
  {
    report_type: 'found',
    category: 'Books & Stationery',
    title: 'Chemistry College Textbook with Notebook',
    description: 'Left behind on chemistry workstation. Includes textbook with post-it bookmarks and college ruled notes.',
    image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    location: 'Chemistry Building 3rd floor lobby',
    event_time: new Date(Date.now() - 10 * 3600000).toISOString(),
    contact_info: 'chem-dept@university.edu'
  }
];
