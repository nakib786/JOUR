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
  PieChart,
  Calendar,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Star
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
  engagement: number;
}

interface EngagementTrend {
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export default function AdminAnalytics({ posts, comments }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'posts' | 'comments' | 'reactions' | 'engagement'>('engagement');

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
      
      const engagement = dayReactions + dayComments.length;
      
      data.push({
        date: dateStr,
        posts: dayPosts.length,
        comments: dayComments.length,
        reactions: dayReactions,
        engagement
      });
    }
    
    setTimeSeriesData(data);
  };

  const getAdvancedMetrics = () => {
    const totalReactions = posts.reduce((sum, post) => 
      sum + Object.values(post.reactions).reduce((a, b) => a + b, 0), 0
    );
    
    const totalComments = comments.length;
    const totalPosts = posts.length;
    const totalEngagement = totalReactions + totalComments;
    
    // Calculate growth rates
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentPosts = posts.filter(post => new Date(post.createdAt) > lastWeek).length;
    const recentComments = comments.filter(comment => new Date(comment.createdAt) > lastWeek).length;
    const recentReactions = posts
      .filter(post => new Date(post.createdAt) > lastWeek)
      .reduce((sum, post) => sum + Object.values(post.reactions).reduce((a, b) => a + b, 0), 0);
    
    const monthlyPosts = posts.filter(post => new Date(post.createdAt) > lastMonth).length;
    const monthlyComments = comments.filter(comment => new Date(comment.createdAt) > lastMonth).length;
    
    // Engagement rate calculations
    const avgEngagementPerPost = totalPosts > 0 ? (totalEngagement / totalPosts).toFixed(1) : '0';
    const avgReactionsPerPost = totalPosts > 0 ? (totalReactions / totalPosts).toFixed(1) : '0';
    const avgCommentsPerPost = totalPosts > 0 ? (totalComments / totalPosts).toFixed(1) : '0';
    
    // Most active day of week
    const dayOfWeekCounts = posts.reduce((acc, post) => {
      const day = new Date(post.createdAt).getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const mostActiveDay = Object.entries(dayOfWeekCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostActiveDayName = mostActiveDay ? dayNames[parseInt(mostActiveDay[0])] : 'N/A';
    
    // Peak posting hours
    const hourCounts = posts.reduce((acc, post) => {
      const hour = new Date(post.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const peakHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    const peakHourFormatted = peakHour ? `${peakHour[0]}:00` : 'N/A';
    
    return {
      totalPosts,
      totalComments,
      totalReactions,
      totalEngagement,
      recentPosts,
      recentComments,
      recentReactions,
      monthlyPosts,
      monthlyComments,
      avgEngagementPerPost,
      avgReactionsPerPost,
      avgCommentsPerPost,
      mostActiveDayName,
      peakHourFormatted,
      engagementRate: totalPosts > 0 ? ((totalEngagement / totalPosts) * 100).toFixed(1) : '0'
    };
  };

  const getTopPerformingPosts = () => {
    return posts
      .map(post => ({
        ...post,
        totalEngagement: Object.values(post.reactions).reduce((a, b) => a + b, 0) + (post.commentCount || 0),
        reactionCount: Object.values(post.reactions).reduce((a, b) => a + b, 0)
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 10);
  };

  const getMoodDistribution = () => {
    const moodCounts = posts.reduce((acc, post) => {
      acc[post.mood] = (acc[post.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const moodColors = {
      hopeful: '#10B981',
      vulnerable: '#F59E0B',
      proud: '#8B5CF6',
      anxious: '#EF4444',
      sad: '#6B7280',
      grateful: '#EC4899',
      reflective: '#3B82F6'
    };

    return Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: ((count / posts.length) * 100).toFixed(1),
        color: moodColors[mood as keyof typeof moodColors] || '#6B7280'
      }));
  };

  const getTagAnalytics = () => {
    const tagCounts = posts.reduce((acc, post) => {
      post.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const tagEngagement = posts.reduce((acc, post) => {
      const engagement = Object.values(post.reactions).reduce((a, b) => a + b, 0) + (post.commentCount || 0);
      post.tags.forEach(tag => {
        if (!acc[tag]) acc[tag] = { count: 0, engagement: 0 };
        acc[tag].count += 1;
        acc[tag].engagement += engagement;
      });
      return acc;
    }, {} as Record<string, { count: number; engagement: number }>);

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: ((count / posts.length) * 100).toFixed(1),
        avgEngagement: tagEngagement[tag] ? (tagEngagement[tag].engagement / count).toFixed(1) : '0'
      }));
  };

  const getEngagementTrends = (): EngagementTrend[] => {
    const now = new Date();
    const periods = [
      { label: 'Today', days: 1 },
      { label: 'This Week', days: 7 },
      { label: 'This Month', days: 30 },
      { label: 'Last 3 Months', days: 90 }
    ];

    return periods.map(period => {
      const startDate = new Date(now.getTime() - period.days * 24 * 60 * 60 * 1000);
      const periodPosts = posts.filter(post => new Date(post.createdAt) > startDate);
      const periodComments = comments.filter(comment => new Date(comment.createdAt) > startDate);
      
      const engagement = periodPosts.reduce((sum, post) => 
        sum + Object.values(post.reactions).reduce((a, b) => a + b, 0), 0
      ) + periodComments.length;
      
      // Calculate previous period for comparison
      const prevStartDate = new Date(startDate.getTime() - period.days * 24 * 60 * 60 * 1000);
      const prevPeriodPosts = posts.filter(post => {
        const date = new Date(post.createdAt);
        return date > prevStartDate && date <= startDate;
      });
      const prevPeriodComments = comments.filter(comment => {
        const date = new Date(comment.createdAt);
        return date > prevStartDate && date <= startDate;
      });
      
      const prevEngagement = prevPeriodPosts.reduce((sum, post) => 
        sum + Object.values(post.reactions).reduce((a, b) => a + b, 0), 0
      ) + prevPeriodComments.length;
      
      const change = prevEngagement > 0 ? ((engagement - prevEngagement) / prevEngagement * 100) : 0;
      const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
      
      return {
        period: period.label,
        value: engagement,
        change: Math.abs(change),
        trend
      };
    });
  };

  const getContentInsights = () => {
    // Average post length
    const avgPostLength = posts.length > 0 
      ? Math.round(posts.reduce((sum, post) => sum + post.content.length, 0) / posts.length)
      : 0;
    
    // Most engaging post length range
    const postsByLength = posts.map(post => ({
      length: post.content.length,
      engagement: Object.values(post.reactions).reduce((a, b) => a + b, 0) + (post.commentCount || 0)
    }));
    
    const lengthRanges = {
      'Short (< 200)': postsByLength.filter(p => p.length < 200),
      'Medium (200-500)': postsByLength.filter(p => p.length >= 200 && p.length < 500),
      'Long (500+)': postsByLength.filter(p => p.length >= 500)
    };
    
    const bestLengthRange = Object.entries(lengthRanges)
      .map(([range, posts]) => ({
        range,
        avgEngagement: posts.length > 0 ? posts.reduce((sum, p) => sum + p.engagement, 0) / posts.length : 0,
        count: posts.length
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)[0];
    
    return {
      avgPostLength,
      bestLengthRange: bestLengthRange?.range || 'N/A',
      bestLengthEngagement: bestLengthRange?.avgEngagement.toFixed(1) || '0'
    };
  };

  const metrics = getAdvancedMetrics();
  const topPosts = getTopPerformingPosts();
  const moodDistribution = getMoodDistribution();
  const tagAnalytics = getTagAnalytics();
  const engagementTrends = getEngagementTrends();
  const contentInsights = getContentInsights();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Time Range Selector */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border border-blue-100 dark:border-gray-600">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Advanced Analytics Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive insights into your content performance and user engagement
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '7d', label: '7 Days', icon: Calendar },
              { value: '30d', label: '30 Days', icon: Calendar },
              { value: '90d', label: '90 Days', icon: Calendar },
              { value: '1y', label: '1 Year', icon: Calendar }
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as '7d' | '30d' | '90d' | '1y')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    timeRange === option.value
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 shadow-md'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Posts',
            value: metrics.totalPosts,
            change: metrics.recentPosts,
            changeLabel: 'this week',
            icon: BarChart3,
            color: 'blue',
            gradient: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Total Comments',
            value: metrics.totalComments,
            change: metrics.recentComments,
            changeLabel: 'this week',
            icon: MessageSquare,
            color: 'green',
            gradient: 'from-green-500 to-green-600'
          },
          {
            title: 'Total Reactions',
            value: metrics.totalReactions,
            change: metrics.recentReactions,
            changeLabel: 'this week',
            icon: Heart,
            color: 'rose',
            gradient: 'from-rose-500 to-rose-600'
          },
          {
            title: 'Engagement Rate',
            value: `${metrics.engagementRate}%`,
            change: metrics.avgEngagementPerPost,
            changeLabel: 'avg per post',
            icon: TrendingUp,
            color: 'purple',
            gradient: 'from-purple-500 to-purple-600'
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.gradient} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${metric.color}-100 text-${metric.color}-800 dark:bg-${metric.color}-900/20 dark:text-${metric.color}-400`}>
                  +{metric.change} {metric.changeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engagement Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Activity className="h-6 w-6 text-indigo-600" />
          Engagement Trends
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {engagementTrends.map((trend, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{trend.period}</p>
                <div className="flex items-center gap-1">
                  {getTrendIcon(trend.trend)}
                  <span className={`text-sm font-medium ${
                    trend.trend === 'up' ? 'text-green-600' : 
                    trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trend.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{trend.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">total engagements</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Content Insights
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Post Length</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentInsights.avgPostLength}</p>
              <p className="text-xs text-gray-500">characters</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Best Performing Length</p>
              <p className="text-lg font-semibold text-orange-600">{contentInsights.bestLengthRange}</p>
              <p className="text-xs text-gray-500">{contentInsights.bestLengthEngagement} avg engagement</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Most Active Day</p>
              <p className="text-lg font-semibold text-blue-600">{metrics.mostActiveDayName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Peak Posting Hour</p>
              <p className="text-lg font-semibold text-green-600">{metrics.peakHourFormatted}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Mood Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            Mood Distribution
          </h3>
          <div className="space-y-3">
            {moodDistribution.map(({ mood, count, percentage, color }) => (
              <div key={mood} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-900 dark:text-white capitalize font-medium">{mood}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Top Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-emerald-600" />
            Top Tags
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tagAnalytics.slice(0, 8).map(({ tag, count, percentage, avgEngagement }) => (
              <div key={tag} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">#{tag}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{avgEngagement} avg engagement</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-emerald-600">{count}</span>
                  <p className="text-xs text-gray-500">({percentage}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Top Performing Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Star className="h-6 w-6 text-yellow-600" />
          Top Performing Posts
        </h3>
        <div className="space-y-4">
          {topPosts.slice(0, 8).map((post, index) => (
            <div key={post.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full text-sm font-bold shadow-lg">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{post.title}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {post.mood}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-rose-600">
                  <Heart className="h-4 w-4" />
                  <span className="font-medium">{post.reactionCount}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">{post.commentCount || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-600">
                  <Zap className="h-4 w-4" />
                  <span className="font-bold">{post.totalEngagement}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Clock className="h-6 w-6 text-indigo-600" />
            Activity Timeline ({timeRange})
          </h3>
          <div className="flex gap-2">
            {['posts', 'comments', 'reactions', 'engagement'].map((metric) => (
              <button
                key={metric}
                                 onClick={() => setSelectedMetric(metric as 'posts' | 'comments' | 'reactions' | 'engagement')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {timeSeriesData.slice(-14).map((data) => {
            const value = data[selectedMetric];
            const maxValue = Math.max(...timeSeriesData.map(d => d[selectedMetric]));
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            return (
              <div key={data.date} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-24">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                    {value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 