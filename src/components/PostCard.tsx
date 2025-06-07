'use client';

import { useState, useEffect } from 'react';
import { Post, Comment } from '@/types';
import { Heart, MessageCircle, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { updatePostReactions, createComment, getCommentsByPostId, getUserReaction, setUserReaction, removeUserReaction, incrementShareCount } from '@/lib/firebase/firestore';
import { ReactionBar } from './ReactionButton';
import { CommentCard } from './CommentCard';
import { SocialShare } from './SocialShare';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState(post.reactions);
  const [userReaction, setUserReactionState] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingReaction, setIsUpdatingReaction] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [shareCount, setShareCount] = useState(post.shareCount || 0);
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

  // Load user's existing reaction for the post
  useEffect(() => {
    const loadUserReaction = async () => {
      try {
        const reaction = await getUserReaction(userId, post.id);
        setUserReactionState(reaction);
      } catch (error) {
        console.error('Error loading user reaction:', error);
      }
    };
    
    loadUserReaction();
  }, [userId, post.id]);

  // Load comments when comments section is opened
  useEffect(() => {
    if (showComments && !commentsLoaded) {
      loadComments();
    }
  }, [showComments, commentsLoaded]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      console.log('Loading comments for post:', post.id);
      
      // Test database connection first
      const { testDatabaseConnection } = await import('../lib/firebase/firestore');
      const connectionOk = await testDatabaseConnection();
      console.log('Database connection test result:', connectionOk);
      
      const fetchedComments = await getCommentsByPostId(post.id);
      console.log('Fetched comments:', fetchedComments);
      setComments(fetchedComments);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('Error loading comments:', error);
      // Set empty array on error to prevent UI issues
      setComments([]);
      setCommentsLoaded(true);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleReaction = async (type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => {
    if (isUpdatingReaction) return;
    
    try {
      setIsUpdatingReaction(true);
      const newReactions = { ...reactions };
      
      if (userReaction === type) {
        // Remove reaction
        newReactions[type] = Math.max(0, newReactions[type] - 1);
        setUserReactionState(null);
        await removeUserReaction(userId, post.id);
      } else {
        // Add new reaction, remove old one if exists
        if (userReaction) {
          newReactions[userReaction as keyof typeof newReactions] = Math.max(0, newReactions[userReaction as keyof typeof newReactions] - 1);
        }
        newReactions[type]++;
        setUserReactionState(type);
        await setUserReaction(userId, type, post.id);
      }
      
      setReactions(newReactions);
      
      // Update in Firebase
      await updatePostReactions(post.id, newReactions);
    } catch (error) {
      console.error('Error updating reaction:', error);
      // Revert on error
      setReactions(post.reactions);
      setUserReactionState(null);
    } finally {
      setIsUpdatingReaction(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isSubmittingComment) return;
    
    try {
      setIsSubmittingComment(true);
      console.log('Submitting comment:', commentText);
      
      const commentId = await createComment({
        postId: post.id,
        text: commentText.trim(),
        ipHash: 'anonymous' // You can implement IP hashing for better anonymity
      });
      
      console.log('Comment created with ID:', commentId);
      
      // Add the new comment to the local state
      const newComment: Comment = {
        id: commentId,
        postId: post.id,
        text: commentText.trim(),
        createdAt: new Date(),
        ipHash: 'anonymous',
        reactions: {
          like: 0,
          love: 0,
          laugh: 0,
          wow: 0,
          sad: 0,
          angry: 0,
        }
      };
      
      setComments(prevComments => [newComment, ...prevComments]);
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentReactionUpdate = (commentId: string, newReactions: Comment['reactions']) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, reactions: newReactions }
          : comment
      )
    );
  };

  const handleShare = async () => {
    try {
      await incrementShareCount(post.id);
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error('Error incrementing share count:', error);
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'hopeful': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'vulnerable': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'proud': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'anxious': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'sad': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
    }
  };

  const formatContent = (content: string) => {
    // Convert hashtags to styled spans
    return content.replace(/#(\w+)/g, '<span class="text-rose-600 dark:text-rose-400 font-medium">#$1</span>');
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-md">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(post.date, 'MMM dd, yyyy')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMoodColor(post.mood)}`}>
                  {post.mood}
                </span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {post.title}
        </h2>

        <div 
          className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reactions and Comments Bar */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <ReactionBar
            reactions={reactions}
            userReaction={userReaction}
            onReaction={handleReaction}
            disabled={isUpdatingReaction}
            size="md"
            showAll={false}
          />

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comments ({comments.length})</span>
            </button>

            <SocialShare
              title={post.title}
              content={post.content}
              tags={post.tags}
              postId={post.id}
              onShare={handleShare}
              url={typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : undefined}
            />
          </div>
        </div>

        {/* Share Count Display */}
        {shareCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Shared {shareCount} {shareCount === 1 ? 'time' : 'times'}
            </p>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
          <div className="space-y-4">
            {/* Comment Input */}
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts anonymously..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {loadingComments ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
                    <span>Loading comments...</span>
                  </div>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onReactionUpdate={handleCommentReactionUpdate}
                  />
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
} 