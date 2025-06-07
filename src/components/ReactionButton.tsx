'use client';

import { useState } from 'react';

interface ReactionButtonProps {
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  count: number;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const reactionConfig = {
  like: {
    icon: '👍',
    label: 'Like',
    activeColor: 'bg-blue-500 text-white',
    hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
  },
  love: {
    icon: '❤️',
    label: 'Love',
    activeColor: 'bg-red-500 text-white',
    hoverColor: 'hover:bg-red-50 dark:hover:bg-red-900/20',
  },
  laugh: {
    icon: '😂',
    label: 'Laugh',
    activeColor: 'bg-yellow-500 text-white',
    hoverColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
  },
  wow: {
    icon: '😮',
    label: 'Wow',
    activeColor: 'bg-purple-500 text-white',
    hoverColor: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
  },
  sad: {
    icon: '😢',
    label: 'Sad',
    activeColor: 'bg-gray-500 text-white',
    hoverColor: 'hover:bg-gray-50 dark:hover:bg-gray-900/20',
  },
  angry: {
    icon: '😠',
    label: 'Angry',
    activeColor: 'bg-orange-500 text-white',
    hoverColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
  },
};

export function ReactionButton({ 
  type, 
  count, 
  isActive, 
  onClick, 
  disabled = false,
  size = 'md'
}: ReactionButtonProps) {
  const config = reactionConfig[type];
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-2 text-sm';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center space-x-1 ${sizeClasses} rounded-full font-medium 
        transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed
        ${isActive 
          ? `${config.activeColor} shadow-md border-transparent` 
          : `bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 ${config.hoverColor}`
        }
      `}
      title={config.label}
    >
      <span className={size === 'sm' ? 'text-sm' : 'text-base'}>
        {config.icon}
      </span>
      {count > 0 && (
        <span className="font-medium">
          {count}
        </span>
      )}
    </button>
  );
}

interface ReactionBarProps {
  reactions: {
    like: number;
    love: number;
    laugh: number;
    wow: number;
    sad: number;
    angry: number;
  };
  userReaction: string | null;
  onReaction: (type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  showAll?: boolean;
}

export function ReactionBar({ 
  reactions, 
  userReaction, 
  onReaction, 
  disabled = false,
  size = 'md',
  showAll = false
}: ReactionBarProps) {
  const [showAllReactions, setShowAllReactions] = useState(showAll);
  
  const reactionTypes: Array<'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'> = 
    ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];
  
  // Show only reactions with counts > 0 or the user's reaction, unless showAll is true
  const visibleReactions = showAllReactions 
    ? reactionTypes 
    : reactionTypes.filter(type => reactions[type] > 0 || userReaction === type);
  
  // Always show like button
  if (!visibleReactions.includes('like')) {
    visibleReactions.unshift('like');
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {visibleReactions.map((type) => (
          <ReactionButton
            key={type}
            type={type}
            count={reactions[type]}
            isActive={userReaction === type}
            onClick={() => onReaction(type)}
            disabled={disabled}
            size={size}
          />
        ))}
      </div>
      
      {!showAllReactions && visibleReactions.length < reactionTypes.length && (
        <button
          onClick={() => setShowAllReactions(true)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Show more reactions"
        >
          <span className="text-lg">➕</span>
        </button>
      )}
    </div>
  );
} 