'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signInWithEmail, logout, isAdmin } from '@/lib/firebase/auth';
import { 
  createPost, 
  getPosts, 
  updatePost, 
  getCommentsByPostId,
  movePostToTrash,
  moveCommentToTrash
} from '@/lib/firebase/firestore';
import { Post, Comment } from '@/types';
import AdminAnalytics from '@/components/AdminAnalytics';
import TrashManager from '@/components/TrashManager';
import { 
  Heart, 
  LogOut, 
  Plus, 
  Save, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Search,
  TrendingUp,
  Activity
} from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { AuthTurnstile, type AuthTurnstileRef } from '@/components/AuthTurnstile';
import Link from 'next/link';

type AdminTab = 'dashboard' | 'posts' | 'comments' | 'analytics' | 'create' | 'trash';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<AuthTurnstileRef>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Post creation form
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    tags: '',
    mood: 'hopeful'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Edit states
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'reactions' | 'comments'>('date');

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isAdmin(user)) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [postsData] = await Promise.all([
        getPosts({ limitCount: 100 })
      ]);
      setPosts(postsData);
      
      // Load comments for all posts
      const allComments: Comment[] = [];
      for (const post of postsData) {
        const postComments = await getCommentsByPostId(post.id);
        allComments.push(...postComments);
      }
      setComments(allComments);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };



  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Turnstile token
    if (!turnstileToken) {
      setLoginError('Please complete the security verification.');
      return;
    }
    
    try {
      setLoginError('');
      await signInWithEmail(email, password);
      setEmail('');
      setPassword('');
      setTurnstileToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } catch (error) {
      console.error('Email sign-in error:', error);
      setLoginError('Invalid email or password');
      // Reset Turnstile on error
      setTurnstileToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) return;

    try {
      setIsSubmitting(true);
      
      const tags = postForm.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      if (editingPost) {
        await updatePost(editingPost.id, {
          title: postForm.title.trim(),
          content: postForm.content.trim(),
          tags,
          mood: postForm.mood,
        });
        setEditingPost(null);
      } else {
        await createPost({
          title: postForm.title.trim(),
          content: postForm.content.trim(),
          tags,
          mood: postForm.mood,
          date: new Date()
        });
      }

      // Reset form
      setPostForm({
        title: '',
        content: '',
        tags: '',
        mood: 'hopeful'
      });

      await loadData();
      setActiveTab('posts');
      alert(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      tags: post.tags.join(', '),
      mood: post.mood
    });
    setActiveTab('create');
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to move this post to trash? You can restore it within 12 months.')) {
      return;
    }

    try {
      await movePostToTrash(postId, user?.email || 'admin');
      await loadData();
      alert('Post moved to trash successfully!');
    } catch (error) {
      console.error('Error moving post to trash:', error);
      alert('Failed to move post to trash. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to move this comment to trash? You can restore it within 12 months.')) {
      return;
    }

    try {
      await moveCommentToTrash(commentId, user?.email || 'admin');
      await loadData();
      alert('Comment moved to trash successfully!');
    } catch (error) {
      console.error('Error moving comment to trash:', error);
      alert('Failed to move comment to trash. Please try again.');
    }
  };

  const formatContent = (content: string) => {
    return content.replace(/#(\w+)/g, '<span class="text-rose-600 dark:text-rose-400 font-medium">#$1</span>');
  };

  const getAnalytics = () => {
    const totalPosts = posts.length;
    const totalComments = comments.length;
    const totalReactions = posts.reduce((sum, post) => 
      sum + Object.values(post.reactions).reduce((a, b) => a + b, 0), 0
    );
    const avgCommentsPerPost = totalPosts > 0 ? (totalComments / totalPosts).toFixed(1) : '0';
    const avgReactionsPerPost = totalPosts > 0 ? (totalReactions / totalPosts).toFixed(1) : '0';

    const recentPosts = posts.filter(post => {
      const postDate = new Date(post.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return postDate > weekAgo;
    }).length;

    return {
      totalPosts,
      totalComments,
      totalReactions,
      avgCommentsPerPost,
      avgReactionsPerPost,
      recentPosts
    };
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'reactions':
        const aReactions = Object.values(a.reactions).reduce((sum, val) => sum + val, 0);
        const bReactions = Object.values(b.reactions).reduce((sum, val) => sum + val, 0);
        return bReactions - aReactions;
      case 'comments':
        return (b.commentCount || 0) - (a.commentCount || 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 animate-pulse text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedLogo size="medium" showText={false} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Access
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to manage Kahani Roz
              </p>
            </div>

            {loginError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
                <p className="text-red-700 dark:text-red-300 text-sm">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Turnstile Widget */}
                <div>
                  <AuthTurnstile
                    ref={turnstileRef}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onError={() => {
                      setTurnstileToken(null);
                      setLoginError('Security verification failed. Please try again.');
                    }}
                    onExpire={() => {
                      setTurnstileToken(null);
                      setLoginError('Security verification expired. Please try again.');
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-rose-500 text-white rounded-lg px-4 py-2 hover:bg-rose-600 transition-colors duration-200"
                >
                  Sign In
                </button>
                <div className="text-center mt-4">
                  <Link
                    href="/reset-password"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-200"
                  >
                    Forgot your password? Reset it here
                  </Link>
                </div>
              </form>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don&apos;t have admin privileges.
          </p>
          <button
            onClick={handleLogout}
            className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const analytics = getAnalytics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user.displayName || user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'posts', label: 'Posts', icon: FileText },
            { id: 'comments', label: 'Comments', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'create', label: 'Create Post', icon: Plus },
            { id: 'trash', label: 'Trash', icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalPosts}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {analytics.recentPosts} new this week
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Comments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalComments}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {analytics.avgCommentsPerPost} avg per post
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reactions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalReactions}</p>
                  </div>
                  <Heart className="h-8 w-8 text-rose-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {analytics.avgReactionsPerPost} avg per post
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {((analytics.totalReactions + analytics.totalComments) / Math.max(analytics.totalPosts, 1)).toFixed(1)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  interactions per post
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{post.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()} • {post.tags.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {Object.values(post.reactions).reduce((a, b) => a + b, 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {post.commentCount || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Posts Management Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'reactions' | 'comments')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="reactions">Sort by Reactions</option>
                  <option value="comments">Sort by Comments</option>
                </select>
              </div>
            </div>

            {/* Posts List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Posts ({sortedPosts.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {loadingData ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading posts...</p>
                  </div>
                ) : sortedPosts.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No posts found</p>
                  </div>
                ) : (
                  sortedPosts.map((post) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">{post.title}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {post.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {Object.values(post.reactions).reduce((a, b) => a + b, 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post.commentCount || 0}
                            </span>
                            <div className="flex gap-1">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                            title="Edit post"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comments Management Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Comments ({comments.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {loadingData ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No comments found</p>
                  </div>
                ) : (
                  comments.map((comment) => {
                    const post = posts.find(p => p.id === comment.postId);
                    return (
                      <div key={comment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white mb-2">{comment.text}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {Object.values(comment.reactions).reduce((a, b) => a + b, 0)}
                              </span>
                              {post && (
                                                                 <span className="text-blue-600 dark:text-blue-400">
                                   on &ldquo;{post.title}&rdquo;
                                 </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                              title="Delete comment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AdminAnalytics posts={posts} comments={comments} />
        )}

        {/* Trash Tab */}
        {activeTab === 'trash' && (
          <TrashManager onDataChange={loadData} />
        )}

        {/* Create/Edit Post Tab */}
        {activeTab === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingPost ? 'Edit Story' : 'Create New Story'}
              </h2>
              <div className="flex items-center gap-2">
                {editingPost && (
                  <button
                    onClick={() => {
                      setEditingPost(null);
                      setPostForm({ title: '', content: '', tags: '', mood: 'hopeful' });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter story title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Share your story... Use #hashtags to categorize your thoughts."
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={postForm.tags}
                    onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="healing, hope, resilience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mood
                  </label>
                  <select
                    value={postForm.mood}
                    onChange={(e) => setPostForm({ ...postForm, mood: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="hopeful">Hopeful</option>
                    <option value="vulnerable">Vulnerable</option>
                    <option value="proud">Proud</option>
                    <option value="anxious">Anxious</option>
                    <option value="sad">Sad</option>
                    <option value="grateful">Grateful</option>
                    <option value="reflective">Reflective</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !postForm.title.trim() || !postForm.content.trim()}
                className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? (editingPost ? 'Updating...' : 'Publishing...') : (editingPost ? 'Update Story' : 'Publish Story')}
              </button>
            </form>

            {/* Preview */}
            {showPreview && postForm.title && postForm.content && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Preview</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {postForm.title}
                  </h4>
                  <div 
                    className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: formatContent(postForm.content) }}
                  />
                  {postForm.tags && (
                    <div className="flex flex-wrap gap-2">
                      {postForm.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 