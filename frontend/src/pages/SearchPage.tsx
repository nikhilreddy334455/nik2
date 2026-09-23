import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Sparkles, Filter, X } from 'lucide-react';
import { Item } from '../lib/types.js';
import { fetchItems } from '../lib/api.js';
import { SearchBar } from '../components/SearchBar.js';
import { ItemCard } from '../components/ItemCard.js';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');

  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state when URL params change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    const typ = searchParams.get('type') || '';
    const st = searchParams.get('status') || '';

    setSearchTerm(q);
    setSelectedCategory(cat);
    setSelectedType(typ);
    setSelectedStatus(st);
  }, [searchParams]);

  // Load items from API based on active filters
  useEffect(() => {
    const loadFilteredItems = async () => {
      try {
        setLoading(true);
        const res = await fetchItems({
          search: searchTerm || undefined,
          category: selectedCategory || undefined,
          type: (selectedType as 'lost' | 'found') || undefined,
          status: (selectedStatus as 'active' | 'resolved') || undefined,
          limit: 100
        });
        setItems(res.items);
        setTotalCount(res.total);
      } catch (err) {
        console.error('Failed to query items:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadFilteredItems();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedType, selectedStatus]);

  // Update query params in URL
  const handleFilterChange = (params: { q?: string; category?: string; type?: string; status?: string }) => {
    const newParams = new URLSearchParams(searchParams);

    if (params.q !== undefined) {
      if (params.q) newParams.set('q', params.q);
      else newParams.delete('q');
      setSearchTerm(params.q);
    }
    if (params.category !== undefined) {
      if (params.category) newParams.set('category', params.category);
      else newParams.delete('category');
      setSelectedCategory(params.category);
    }
    if (params.type !== undefined) {
      if (params.type) newParams.set('type', params.type);
      else newParams.delete('type');
      setSelectedType(params.type);
    }
    if (params.status !== undefined) {
      if (params.status) newParams.set('status', params.status);
      else newParams.delete('status');
      setSelectedStatus(params.status);
    }

    setSearchParams(newParams, { replace: true });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedStatus('');
    setSearchParams({});
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-slate-100">
          Campus Lost & Found Directory
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Search multimodal records across campus locations, categories, and report classifications.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={(q) => handleFilterChange({ q })}
        selectedCategory={selectedCategory}
        onCategoryChange={(category) => handleFilterChange({ category })}
        selectedType={selectedType}
        onTypeChange={(type) => handleFilterChange({ type })}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => handleFilterChange({ status })}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>
          Showing {items.length} of {totalCount} Items
        </span>
        {selectedType && (
          <span className="text-sky-400 font-bold">
            Filtered by: {selectedType.toUpperCase()}
          </span>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 glass-panel rounded-2xl bg-slate-800/40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Package size={28} />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-200">No matching items found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your search keywords or removing active category/type filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
