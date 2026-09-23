import axios from 'axios';
import { Item, ItemMatch, DashboardStats, ItemFormData, ItemDetailResponse } from './types.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchItems = async (params?: {
  type?: 'lost' | 'found';
  category?: string;
  search?: string;
  status?: 'active' | 'resolved';
  limit?: number;
  offset?: number;
}): Promise<{ items: Item[]; total: number }> => {
  const response = await api.get('/items', { params });
  return {
    items: response.data.data,
    total: response.data.pagination.total
  };
};

export const fetchItemById = async (id: string): Promise<Item> => {
  const response = await api.get(`/items/${id}`);
  return response.data.data;
};

export const createItem = async (data: ItemFormData): Promise<Item> => {
  const response = await api.post('/items', data);
  return response.data.data;
};

export const fetchItemMatches = async (id: string): Promise<ItemDetailResponse> => {
  const response = await api.get(`/items/${id}/matches`);
  return response.data.data;
};

export const triggerItemMatch = async (id: string): Promise<{
  evaluated_candidates: number;
  top_confidence_score: number;
  matches: ItemMatch[];
}> => {
  const response = await api.post(`/trigger-match/${id}`);
  return response.data.data;
};

export const updateItemStatus = async (id: string, status: 'active' | 'resolved'): Promise<Item> => {
  const response = await api.patch(`/items/${id}/status`, { status });
  return response.data.data;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/stats');
  return response.data.data;
};

export const seedDatabase = async (): Promise<{ createdCount: number; stats: DashboardStats }> => {
  const response = await api.post('/seed');
  return response.data.data;
};
