'use client';

import { useState, useEffect } from 'react';
import { Post, Comment } from '@/types';
import { 
  BarChart3, 
  TrendingUp, 
  Heart, 
  MessageSquare,
  Tag,
  Clock,
  Activity,
  PieChart
} from 'lucide-react';

interface AnalyticsProps {
  posts: Post[];
  comments: Comment[];
}

interface TimeSeriesData {
  date: string;
  posts: number;
  comments: number;
  reactions: number;
}

export default function AdminAnalytics({ posts, comments }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  useEffect(() => {
    generateTimeSeriesData();
  }, [posts, comments, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateTimeSeriesData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const data: TimeSeriesData[] = [];
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayPosts = posts.filter(post => {
        const postDate = new Date(post.createdAt).toISOString().split('T')[0];
        return postDate === dateStr;
      });
      
      const dayComments = comments.filter(comment => {
        const commentDate = new Date(comment.createdAt).toISOString().split('T')[0];
        return commentDate === dateStr;
      });
      
      const dayReactions = dayPosts.reduce((sum, post) => 
        sum + Object.values(post.reactions).reduce((a, b) => a + b, 0), 0
      );
      
      data.push({
        date: dateStr,
        posts: dayPosts.length,
        comments: dayComments.length,
        reactions: dayReactions
      });
    }
    
    setTimeSeriesData(data);
  };

  const getTopPerformingPosts = () => {
    return posts
      .map(post => ({
        ...post,
        totalEngagement: Object.values(post.reactions).reduce((a, b) => a + b, 0) + (post.commentCount || 0)
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5);
  };

  const getMoodDistribution = () => {
    const moodCounts = posts.reduce((acc, post) => {
      acc[post.mood] = (acc[post.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: ((count / posts.length) * 100).toFixed(1)
    }));
  };

  const getTagAnalytics = () => {
    const tagCounts = posts.reduce((acc, post) => {
      post.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: ((count / posts.length) * 100).toFixed(1)
      }));
  };

  const getEngagementMetrics = () => {
    const totalReactions = posts.reduce((sum, post) => 
      sum + Object.values(post.reactions).reduce((a, b) => a + b, 0), 0
    );
    
    const totalComments = comments.length;
    const totalPosts = posts.length;
    
    const avgReactionsPerPost = totalPosts > 0 ? (totalReactions / totalPosts).toFixed(1) : '0';
    const avgCommentsPerPost = totalPosts > 0 ? (totalComments / totalPosts).toFixed(1) : '0';
    const engagementRate = totalPosts > 0 ? (((totalReactions + totalComments) / totalPosts)).toFixed(1) : '0';
    
    return {
      totalReactions,
      totalComments,
      avgReactionsPerPost,
      avgCommentsPerPost,
      engagementRate
    };
  };

  const getRecentActivity = () => {
    const recentPosts = posts
      .filter(post => {
        const postDate = new Date(post.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return postDate > weekAgo;
      }).length;

    const recentComments = comments
      .filter(comment => {
        const commentDate = new Date(comment.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return commentDate > weekAgo;
      }).length;

    return { recentPosts, recentComments };
  };

  const topPosts = getTopPerformingPosts();
  const moodDistribution = getMoodDistribution();
  const tagAnalytics = getTagAnalytics();
  const engagementMetrics = getEngagementMetrics();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analytics Overview</h3>
          <div className="flex space-x-2">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
              { value: '1y', label: '1 Year' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as '7d' | '30d' | '90d' | '1y')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  timeRange === option.value
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Posts</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{posts.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              +{recentActivity.recentPosts} this week
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Comments</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{comments.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +{recentActivity.recentComments} this week
            </p>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Total Reactions</p>
                <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">{engagementMetrics.totalReactions}</p>
              </div>
              <Heart className="h-8 w-8 text-rose-500" />
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
              {engagementMetrics.avgReactionsPerPost} avg per post
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Engagement Rate</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{engagementMetrics.engagementRate}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              interactions per post
            </p>
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Performing Posts
        </h3>
        <div className="space-y-4">
          {topPosts.map((post, index) => (
            <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-rose-500 text-white rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{post.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
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
                <span className="font-medium text-gray-900 dark:text-white">
                  {post.totalEngagement} total
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Mood Distribution
          </h3>
          <div className="space-y-3">
            {moodDistribution.map(({ mood, count, percentage }) => (
              <div key={mood} className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white capitalize">{mood}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Popular Tags
          </h3>
          <div className="space-y-3">
            {tagAnalytics.map(({ tag, count, percentage }) => (
              <div key={tag} className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">#{tag}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-rose-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline ({timeRange})
        </h3>
        <div className="space-y-2">
          {timeSeriesData.slice(-7).map((data) => (
            <div key={data.date} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(data.date).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="h-4 w-4" />
                  {data.posts} posts
                </span>
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <MessageSquare className="h-4 w-4" />
                  {data.comments} comments
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <Heart className="h-4 w-4" />
                  {data.reactions} reactions
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 