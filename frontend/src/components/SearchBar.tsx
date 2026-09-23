import React from 'react';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { TARGET_CATEGORIES } from '../lib/types.js';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  onReset?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedType,
  onTypeChange,
  selectedStatus = '',
  onStatusChange,
  onReset
}) => {
  const hasActiveFilters = Boolean(searchTerm || selectedCategory || selectedType || selectedStatus);

  return (
    <div className="w-full glass-panel rounded-2xl p-4 md:p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Search Input Row */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
        <input
          type="text"
          id="search-input"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by keyword, item title, campus building, room..."
          className="w-full pl-11 pr-10 py-3 bg-slate-900/90 border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Clear text"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Selectors Row */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Report Type Filter */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => onTypeChange('')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedType === '' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => onTypeChange('lost')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedType === 'lost' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📍 Lost Only
          </button>
          <button
            onClick={() => onTypeChange('found')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedType === 'found' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ Found Only
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="relative min-w-[170px]">
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
          >
            <option value="">All Categories ({TARGET_CATEGORIES.length})</option>
            {TARGET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
        </div>

        {/* Status Dropdown */}
        {onStatusChange && (
          <div className="relative min-w-[130px]">
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        )}

        {/* Reset Filter Button */}
        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 transition-colors ml-auto"
          >
            <RefreshCw size={12} /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
