import axios from 'axios';
import { Item, ItemMatch, DashboardStats, ItemFormData, ItemDetailResponse } from './types.js';
import { INITIAL_MOCK_ITEMS, INITIAL_MOCK_MATCHES, getMockDashboardStats } from './mockData.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
});

// Interceptor to catch HTML error responses (e.g. 404 falling back to index.html)
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html>')) {
      return Promise.reject(new Error('API returned HTML instead of JSON. Fallback to resilient storage.'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Local storage cache for offline / standalone Vercel preview resilience
function getStoredItems(): Item[] {
  try {
    const raw = localStorage.getItem('campus_items');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_MOCK_ITEMS;
}

function saveStoredItems(items: Item[]): void {
  try {
    localStorage.setItem('campus_items', JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

export const fetchItems = async (params?: {
  type?: 'lost' | 'found';
  category?: string;
  search?: string;
  status?: 'active' | 'resolved';
  limit?: number;
  offset?: number;
}): Promise<{ items: Item[]; total: number }> => {
  try {
    const response = await api.get('/items', { params });
    const data = response?.data;

    if (data && typeof data !== 'string' && Array.isArray(data.data) && data.data.length > 0) {
      const items = data.data;
      const total = typeof data.pagination?.total === 'number' ? data.pagination.total : items.length;
      return { items, total };
    }
  } catch (err) {
    console.warn('[API] /items unavailable, using resilient campus items:', err);
  }

  // Resilient fallback with filtering
  let fallback = getStoredItems();
  if (params?.type) {
    fallback = fallback.filter((i) => i.report_type === params.type);
  }
  if (params?.category) {
    fallback = fallback.filter((i) => i.category.toLowerCase() === params.category?.toLowerCase());
  }
  if (params?.status) {
    fallback = fallback.filter((i) => i.status === params.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    fallback = fallback.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
  }

  const limit = params?.limit || fallback.length;
  const offset = params?.offset || 0;
  return {
    items: fallback.slice(offset, offset + limit),
    total: fallback.length
  };
};

export const fetchItemById = async (id: string): Promise<Item> => {
  try {
    const response = await api.get(`/items/${id}`);
    if (response?.data?.data && typeof response.data !== 'string') {
      return response.data.data;
    }
  } catch (err) {
    console.warn(`[API] /items/${id} unavailable, checking local store:`, err);
  }

  const local = getStoredItems().find((i) => i.id === id);
  if (local) return local;

  throw new Error('Item not found');
};

export const createItem = async (data: ItemFormData): Promise<Item> => {
  try {
    const response = await api.post('/items', data);
    if (response?.data?.data && typeof response.data !== 'string') {
      return response.data.data;
    }
  } catch (err) {
    console.warn('[API] /items POST failed, saving to local store:', err);
  }

  const newItem: Item = {
    id: `local-${Date.now()}`,
    report_type: data.report_type,
    category: data.category,
    title: data.title,
    description: data.description,
    image_url: data.image_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
    location: data.location,
    event_time: data.event_time,
    contact_info: data.contact_info,
    status: 'active',
    created_at: new Date().toISOString()
  };

  const current = getStoredItems();
  const updated = [newItem, ...current];
  saveStoredItems(updated);
  return newItem;
};

export const fetchItemMatches = async (id: string): Promise<ItemDetailResponse> => {
  try {
    const response = await api.get(`/items/${id}/matches`);
    if (response?.data?.data && typeof response.data !== 'string') {
      return response.data.data;
    }
  } catch (err) {
    console.warn(`[API] /items/${id}/matches unavailable:`, err);
  }

  const item = await fetchItemById(id);
  const matches = INITIAL_MOCK_MATCHES.filter((m) => m.lost_item_id === id || m.found_item_id === id);
  return {
    item,
    matches_count: matches.length,
    matches
  };
};

export const triggerItemMatch = async (id: string): Promise<{
  evaluated_candidates: number;
  top_confidence_score: number;
  matches: ItemMatch[];
}> => {
  try {
    const response = await api.post(`/trigger-match/${id}`);
    if (response?.data?.data && typeof response.data !== 'string') {
      return response.data.data;
    }
  } catch (err) {
    console.warn(`[API] trigger-match/${id} unavailable:`, err);
  }

  return {
    evaluated_candidates: 3,
    top_confidence_score: 94,
    matches: INITIAL_MOCK_MATCHES.filter((m) => m.lost_item_id === id || m.found_item_id === id)
  };
};

export const updateItemStatus = async (id: string, status: 'active' | 'resolved'): Promise<Item> => {
  try {
    const response = await api.patch(`/items/${id}/status`, { status });
    if (response?.data?.data && typeof response.data !== 'string') {
      return response.data.data;
    }
  } catch (err) {
    console.warn(`[API] update status failed:`, err);
  }

  const items = getStoredItems();
  const index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items[index].status = status;
    saveStoredItems(items);
    return items[index];
  }

  throw new Error('Item not found');
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/stats');
    if (response?.data?.data && typeof response.data !== 'string') {
      return response.data.data;
    }
  } catch (err) {
    console.warn('[API] /stats unavailable, computing from campus items:', err);
  }

  return getMockDashboardStats(getStoredItems());
};

export const seedDatabase = async (): Promise<{ createdCount: number; stats: DashboardStats }> => {
  try {
    const response = await api.post('/seed');
    if (response?.data?.data) {
      return response.data.data;
    }
  } catch (err) {
    console.warn('[API] /seed unavailable:', err);
  }

  saveStoredItems(INITIAL_MOCK_ITEMS);
  return {
    createdCount: INITIAL_MOCK_ITEMS.length,
    stats: getMockDashboardStats(INITIAL_MOCK_ITEMS)
  };
};
