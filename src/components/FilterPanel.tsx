'use client';

import { useState } from 'react';
import { FilterOptions } from '@/types';
import { Search, X, Calendar, Tag } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const availableTags = [
  'healing', 'hope', 'resilience', 'panicattack', 'selfcompassion', 
  'mentalhealth', 'wins', 'depression', 'progress', 'selfcare',
  'anxiety', 'growth', 'mindfulness', 'therapy', 'support',
  'gratitude', 'breakthrough', 'struggle', 'recovery', 'strength'
];

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    onFiltersChange({
      ...filters,
      searchQuery: value
    });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFiltersChange({
      ...filters,
      tags: newTags
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    onFiltersChange({
      tags: [],
      dateRange: { start: null, end: null },
      searchQuery: ''
    });
  };

  const hasActiveFilters = filters.tags.length > 0 || filters.searchQuery || 
    filters.dateRange.start || filters.dateRange.end;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Tag className="h-5 w-5 mr-2 text-rose-500" />
          Filter Stories
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-200 flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Stories
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, content, or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Filter by Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
          {filters.tags.length > 0 && (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Selected: {filters.tags.map(tag => `#${tag}`).join(', ')}
            </div>
          )}
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Date Range
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: date }
                    });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: date }
                    });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFiltersChange({
                ...filters,
                dateRange: { 
                  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
                  end: new Date() 
                }
              })}
              className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
            >
              Last 7 days
            </button>
            <button
              onClick={() => onFiltersChange({
                ...filters,
                dateRange: { 
                  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
                  end: new Date() 
                }
              })}
              className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200"
            >
              Last 30 days
            </button>
            <button
              onClick={() => onFiltersChange({
                ...filters,
                tags: ['healing', 'hope', 'wins']
              })}
              className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200"
            >
              Positive vibes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 