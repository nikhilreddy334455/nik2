import axios from 'axios';
import { Item, ItemMatch, DashboardStats, ItemFormData, ItemDetailResponse } from './types.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to catch HTML error responses (e.g. 404 falling back to index.html)
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html>')) {
      return Promise.reject(new Error('API returned HTML instead of JSON. Ensure backend service is deployed and running.'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

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

    if (!data || typeof data === 'string') {
      return { items: [], total: 0 };
    }

    const items = Array.isArray(data.data) ? data.data : [];
    const total = typeof data.pagination?.total === 'number' ? data.pagination.total : items.length;

    return { items, total };
  } catch (err) {
    console.warn('[API] fetchItems error:', err);
    return { items: [], total: 0 };
  }
};

export const fetchItemById = async (id: string): Promise<Item> => {
  const response = await api.get(`/items/${id}`);
  if (!response?.data?.data) {
    throw new Error('Item not found or backend API is unavailable');
  }
  return response.data.data;
};

export const createItem = async (data: ItemFormData): Promise<Item> => {
  const response = await api.post('/items', data);
  if (!response?.data?.data) {
    throw new Error('Failed to create item');
  }
  return response.data.data;
};

export const fetchItemMatches = async (id: string): Promise<ItemDetailResponse> => {
  const response = await api.get(`/items/${id}/matches`);
  if (!response?.data?.data) {
    throw new Error('Item matches unavailable');
  }
  return response.data.data;
};

export const triggerItemMatch = async (id: string): Promise<{
  evaluated_candidates: number;
  top_confidence_score: number;
  matches: ItemMatch[];
}> => {
  const response = await api.post(`/trigger-match/${id}`);
  if (!response?.data?.data) {
    throw new Error('Matching trigger failed');
  }
  return response.data.data;
};

export const updateItemStatus = async (id: string, status: 'active' | 'resolved'): Promise<Item> => {
  const response = await api.patch(`/items/${id}/status`, { status });
  if (!response?.data?.data) {
    throw new Error('Failed to update status');
  }
  return response.data.data;
};

const DEFAULT_STATS: DashboardStats = {
  totalItems: 0,
  lostItems: 0,
  foundItems: 0,
  resolvedItems: 0,
  totalMatches: 0,
  highConfidenceMatches: 0
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/stats');
    if (!response?.data?.data || typeof response.data === 'string') {
      return DEFAULT_STATS;
    }
    return response.data.data;
  } catch (err) {
    console.warn('[API] fetchDashboardStats error:', err);
    return DEFAULT_STATS;
  }
};

export const seedDatabase = async (): Promise<{ createdCount: number; stats: DashboardStats }> => {
  const response = await api.post('/seed');
  return response.data.data;
};
