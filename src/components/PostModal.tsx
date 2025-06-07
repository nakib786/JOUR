'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Calendar, Tag, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Post, Comment } from '@/types';
import { ReactionBar } from './ReactionButton';
import { CommentCard } from './CommentCard';
import { SocialShare } from './SocialShare';
import { updatePostReactions, createComment, getCommentsByPostId, getUserReaction, setUserReaction, removeUserReaction, incrementShareCount } from '@/lib/firebase/firestore';

interface PostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ post, isOpen, onClose }: PostModalProps) {
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState(post?.reactions || {
    like: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  });
  const [userReaction, setUserReactionState] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingReaction, setIsUpdatingReaction] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [shareCount, setShareCount] = useState(post?.shareCount || 0);
  const [userId] = useState(() => {
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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowComments(false);
      setCommentText('');
      setCommentsLoaded(false);
      setComments([]);
    } else if (post) {
      setReactions(post.reactions);
      setShareCount(post.shareCount || 0);
    }
  }, [isOpen, post]);

  // Load user's existing reaction for the post
  useEffect(() => {
    if (post && isOpen) {
      const loadUserReaction = async () => {
        try {
          const reaction = await getUserReaction(userId, post.id);
          setUserReactionState(reaction);
        } catch (error) {
          console.error('Error loading user reaction:', error);
        }
      };
      
      loadUserReaction();
    }
  }, [userId, post?.id, isOpen]);

  // Load comments when comments section is opened
  useEffect(() => {
    if (showComments && !commentsLoaded && post) {
      loadComments();
    }
  }, [showComments, commentsLoaded, post]);

  const loadComments = async () => {
    if (!post) return;
    
    try {
      setLoadingComments(true);
      const fetchedComments = await getCommentsByPostId(post.id);
      setComments(fetchedComments);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
      setCommentsLoaded(true);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleReaction = async (type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry') => {
    if (isUpdatingReaction || !post) return;
    
    try {
      setIsUpdatingReaction(true);
      const newReactions = { ...reactions };
      
      if (userReaction === type) {
        newReactions[type] = Math.max(0, newReactions[type] - 1);
        setUserReactionState(null);
        await removeUserReaction(userId, post.id);
      } else {
        if (userReaction) {
          newReactions[userReaction as keyof typeof newReactions] = Math.max(0, newReactions[userReaction as keyof typeof newReactions] - 1);
        }
        newReactions[type]++;
        setUserReactionState(type);
        await setUserReaction(userId, type, post.id);
      }
      
      setReactions(newReactions);
      await updatePostReactions(post.id, newReactions);
    } catch (error) {
      console.error('Error updating reaction:', error);
      setReactions(post.reactions);
      setUserReactionState(null);
    } finally {
      setIsUpdatingReaction(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isSubmittingComment || !post) return;
    
    try {
      setIsSubmittingComment(true);
      
      const commentId = await createComment({
        postId: post.id,
        text: commentText.trim(),
        ipHash: 'anonymous'
      });
      
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
    if (!post) return;
    
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
    return content.replace(/#(\w+)/g, '<span class="text-rose-600 dark:text-rose-400 font-medium">#$1</span>');
  };

  if (!isOpen || !post) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div 
          className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: 15 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300,
            duration: 0.5 
          }}
        >
          {/* Header with Close Button */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Heart className="h-6 w-6 text-white" />
              </motion.div>
              <div>
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
            
            <motion.button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-8">
              {/* Title */}
              <motion.h1 
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {post.title}
              </motion.h1>

              {/* Content */}
              <motion.div 
                className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8 prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              />

              {/* Tags */}
              {post.tags.length > 0 && (
                <motion.div 
                  className="flex flex-wrap gap-3 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {post.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {/* Reactions and Actions */}
              <motion.div 
                className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <ReactionBar
                    reactions={reactions}
                    userReaction={userReaction}
                    onReaction={handleReaction}
                    disabled={isUpdatingReaction}
                    size="md"
                    showAll={true}
                  />

                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={() => setShowComments(!showComments)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Comments ({comments.length})</span>
                    </motion.button>

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
                  <motion.div 
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Shared {shareCount} {shareCount === 1 ? 'time' : 'times'}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Comments Section */}
              <AnimatePresence>
                {showComments && (
                  <motion.div 
                    className="border-t border-gray-200 dark:border-gray-700 pt-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      {/* Comment Input */}
                      <div className="flex space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">👤</span>
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts anonymously..."
                            className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none transition-all duration-200"
                            rows={4}
                          />
                          <div className="flex justify-end mt-3">
                            <motion.button 
                              onClick={handleCommentSubmit}
                              disabled={!commentText.trim() || isSubmittingComment}
                              className="px-6 py-3 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-4">
                        {loadingComments ? (
                          <div className="text-center py-8">
                            <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500"></div>
                              <span>Loading comments...</span>
                            </div>
                          </div>
                        ) : comments.length > 0 ? (
                          comments.map((comment, index) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <CommentCard
                                comment={comment}
                                onReactionUpdate={handleCommentReactionUpdate}
                              />
                            </motion.div>
                          ))
                        ) : (
                          <motion.div 
                            className="text-center py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <p className="text-gray-500 dark:text-gray-400">
                              No comments yet. Be the first to share your thoughts!
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 