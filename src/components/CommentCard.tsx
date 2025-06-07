'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { format } from 'date-fns';
import { ReactionBar } from './ReactionButton';
import { updateCommentReactions, getUserReaction, setUserReaction, removeUserReaction } from '@/lib/firebase/firestore';

interface CommentCardProps {
  comment: Comment;
  onReactionUpdate?: (commentId: string, reactions: Comment['reactions']) => void;
}

export function CommentCard({ comment, onReactionUpdate }: CommentCardProps) {
  const [reactions, setReactions] = useState(comment.reactions);
  const [userReaction, setUserReactionState] = useState<string | null>(null);
  const [isUpdatingReaction, setIsUpdatingReaction] = useState(false);
  const [userId] = useState(() => {
    // Generate a simple user ID based on browser fingerprint
    // In a real app, you'd use proper authentication
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('anonymousUserId');
      if (!id) {
        id = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('anonymousUserId', id);
      }
      return id;
    }
    return 'anon_' + Math.random().toString(36).substr(2, 9);
  });

  // Load user's existing reaction
  useEffect(() => {
    const loadUserReaction = async () => {
      try {
        const reaction = await getUserReaction(userId, undefined, comment.id);
        setUserReactionState(reaction);
      } catch (error) {
        console.error('Error loading user reaction:', error);
      }
    };
    
    loadUserReaction();
  }, [userId, comment.id]);

  // Sync reactions when comment changes
  useEffect(() => {
    setReactions(comment.reactions);
  }, [comment.reactions]);

  const handleReaction = async (type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => {
    if (isUpdatingReaction) return;
    
    try {
      setIsUpdatingReaction(true);
      const newReactions = { ...reactions };
      
      if (userReaction === type) {
        // Remove reaction
        newReactions[type] = Math.max(0, newReactions[type] - 1);
        setUserReactionState(null);
        await removeUserReaction(userId, undefined, comment.id);
      } else {
        // Add new reaction, remove old one if exists
        if (userReaction) {
          newReactions[userReaction as keyof typeof newReactions] = Math.max(0, newReactions[userReaction as keyof typeof newReactions] - 1);
        }
        newReactions[type]++;
        setUserReactionState(type);
        await setUserReaction(userId, type, undefined, comment.id);
      }
      
      setReactions(newReactions);
      
      // Update in Firebase
      await updateCommentReactions(comment.id, newReactions);
      
      // Notify parent component
      onReactionUpdate?.(comment.id, newReactions);
    } catch (error) {
      console.error('Error updating reaction:', error);
      // Revert on error
      setReactions(comment.reactions);
      setUserReactionState(null);
    } finally {
      setIsUpdatingReaction(false);
    }
  };

  const formatCommentTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return format(date, 'MMM dd');
  };

  return (
    <div className="flex space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        comment.isAuthorReply 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-blue-400 to-blue-500'
      }`}>
        <span className="text-white text-sm">
          {comment.isAuthorReply ? '✍️' : '👤'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <div className="flex items-start gap-2">
            <p className="text-gray-700 dark:text-gray-300 text-sm break-words flex-1">
              {comment.text}
            </p>
            {comment.isAuthorReply && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex-shrink-0">
                Author
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            {formatCommentTime(comment.createdAt)}
          </span>
        </div>
        
        <ReactionBar
          reactions={reactions}
          userReaction={userReaction}
          onReaction={handleReaction}
          disabled={isUpdatingReaction}
          size="sm"
          showAll={false}
        />
      </div>
    </div>
  );
} 