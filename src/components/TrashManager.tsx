'use client';

import { useState, useEffect } from 'react';
import { TrashItem } from '@/types';
import { 
  getTrashItems, 
  restorePostFromTrash, 
  restoreCommentFromTrash, 
  permanentlyDeleteTrashItem,
  cleanupExpiredTrashItems
} from '@/lib/firebase/firestore';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  MessageSquare,
  Search,
  RefreshCw
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface TrashManagerProps {
  onDataChange?: () => void;
}

export default function TrashManager({ onDataChange }: TrashManagerProps) {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'post' | 'comment'>('all');
  const [sortBy, setSortBy] = useState<'deletedAt' | 'expiresAt' | 'type'>('deletedAt');

  useEffect(() => {
    loadTrashItems();
  }, []);

  const loadTrashItems = async () => {
    try {
      setLoading(true);
      const items = await getTrashItems();
      setTrashItems(items);
    } catch (error) {
      console.error('Error loading trash items:', error);
      alert('Failed to load trash items');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item: TrashItem) => {
    if (!confirm(`Are you sure you want to restore this ${item.type}?`)) {
      return;
    }

    try {
      if (item.type === 'post') {
        await restorePostFromTrash(item.id);
      } else {
        await restoreCommentFromTrash(item.id);
      }
      
      await loadTrashItems();
      onDataChange?.();
      alert(`${item.type === 'post' ? 'Post' : 'Comment'} restored successfully!`);
    } catch (error) {
      console.error('Error restoring item:', error);
      alert(`Failed to restore ${item.type}. ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    if (!confirm(`Are you sure you want to permanently delete this ${item.type}? This action cannot be undone.`)) {
      return;
    }

    try {
      await permanentlyDeleteTrashItem(item.id);
      await loadTrashItems();
      alert(`${item.type === 'post' ? 'Post' : 'Comment'} permanently deleted!`);
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      alert(`Failed to permanently delete ${item.type}. Please try again.`);
    }
  };

  const handleCleanupExpired = async () => {
    if (!confirm('Are you sure you want to permanently delete all expired items? This action cannot be undone.')) {
      return;
    }

    try {
      const deletedCount = await cleanupExpiredTrashItems();
      await loadTrashItems();
      alert(`${deletedCount} expired items permanently deleted!`);
    } catch (error) {
      console.error('Error cleaning up expired items:', error);
      alert('Failed to cleanup expired items. Please try again.');
    }
  };

  const filteredItems = trashItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'expiresAt':
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime();
    }
  });

  const expiredItems = trashItems.filter(item => new Date(item.expiresAt) <= new Date());
  const expiringItems = trashItems.filter(item => {
    const expiresAt = new Date(item.expiresAt);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiresAt > now && expiresAt <= thirtyDaysFromNow;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading trash items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trash Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage deleted posts and comments. Items are automatically deleted after 12 months.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadTrashItems}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          
          {expiredItems.length > 0 && (
            <button
              onClick={handleCleanupExpired}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4" />
              Cleanup Expired ({expiredItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {expiredItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200 font-medium">
              {expiredItems.length} item{expiredItems.length !== 1 ? 's' : ''} have expired and can be cleaned up
            </p>
          </div>
        </div>
      )}

      {expiringItems.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              {expiringItems.length} item{expiringItems.length !== 1 ? 's' : ''} will expire within 30 days
            </p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trash items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'post' | 'comment')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="post">Posts</option>
            <option value="comment">Comments</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'deletedAt' | 'expiresAt' | 'type')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="deletedAt">Deleted Date</option>
            <option value="expiresAt">Expiry Date</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Trash2 className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{trashItems.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {trashItems.filter(item => item.type === 'post').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {trashItems.filter(item => item.type === 'comment').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{expiredItems.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trash Items List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {sortedItems.length === 0 ? (
          <div className="p-8 text-center">
            <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {trashItems.length === 0 ? 'No items in trash' : 'No items match your filters'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedItems.map((item) => {
              const isExpired = new Date(item.expiresAt) <= new Date();
              const isExpiringSoon = !isExpired && new Date(item.expiresAt) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              
              return (
                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'post' ? (
                          <FileText className="h-4 w-4 text-blue-500" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {item.type}
                        </span>
                        {isExpired && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full">
                            Expired
                          </span>
                        )}
                        {isExpiringSoon && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                            Expiring Soon
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {item.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          Deleted {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}
                        </span>
                        {item.deletedBy && (
                          <span>by {item.deletedBy}</span>
                        )}
                        <span>
                          Expires {format(new Date(item.expiresAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      
                      {item.metadata?.tags && item.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.metadata.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {!isExpired && (
                        <button
                          onClick={() => handleRestore(item)}
                          className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                          title="Restore item"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                        title="Permanently delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 