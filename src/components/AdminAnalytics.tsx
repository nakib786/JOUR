'use client';

import { useState, useEffect, useRef } from 'react';
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
  Star,
  Globe,
  MapPin,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { getVisitorAnalytics, getAnalyticsSummary, VisitorData } from '@/lib/analytics';

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
  const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
  const [visitorSummary, setVisitorSummary] = useState<{
    totalVisits: number;
    uniqueVisitors: number;
    topPages: { page: string; visits: number }[];
    topCountries: { country: string; visits: number }[];
    topCities: { city: string; visits: number }[];
  } | null>(null);
  const [loadingVisitorData, setLoadingVisitorData] = useState(false);
  
  // Collapsible section states
  const [isEngagementTrendsCollapsed, setIsEngagementTrendsCollapsed] = useState(false);
  const [isContentInsightsCollapsed, setIsContentInsightsCollapsed] = useState(false);
  const [isTopPostsCollapsed, setIsTopPostsCollapsed] = useState(false);
  const [isActivityTimelineCollapsed, setIsActivityTimelineCollapsed] = useState(true);
  const [isVisitorAnalyticsCollapsed, setIsVisitorAnalyticsCollapsed] = useState(true);

  // Pinned states (when clicked to stay open)
  const [isEngagementTrendsPinned, setIsEngagementTrendsPinned] = useState(false);
  const [isContentInsightsPinned, setIsContentInsightsPinned] = useState(false);
  const [isTopPostsPinned, setIsTopPostsPinned] = useState(false);
  const [isActivityTimelinePinned, setIsActivityTimelinePinned] = useState(false);
  const [isVisitorAnalyticsPinned, setIsVisitorAnalyticsPinned] = useState(false);

  // Hover states
  const [isEngagementTrendsHovered, setIsEngagementTrendsHovered] = useState(false);
  const [isContentInsightsHovered, setIsContentInsightsHovered] = useState(false);
  const [isTopPostsHovered, setIsTopPostsHovered] = useState(false);
  const [isActivityTimelineHovered, setIsActivityTimelineHovered] = useState(false);
  const [isVisitorAnalyticsHovered, setIsVisitorAnalyticsHovered] = useState(false);

  // Animation ref for smooth height transitions
  const engagementTrendsRef = useRef<HTMLDivElement>(null);

  // Helper functions to determine if sections should be open
  const shouldShowEngagementTrends = !isEngagementTrendsCollapsed || isEngagementTrendsHovered || isEngagementTrendsPinned;
  const shouldShowContentInsights = !isContentInsightsCollapsed || isContentInsightsHovered || isContentInsightsPinned;
  const shouldShowTopPosts = !isTopPostsCollapsed || isTopPostsHovered || isTopPostsPinned;
  const shouldShowActivityTimeline = !isActivityTimelineCollapsed || isActivityTimelineHovered || isActivityTimelinePinned;
  const shouldShowVisitorAnalytics = !isVisitorAnalyticsCollapsed || isVisitorAnalyticsHovered || isVisitorAnalyticsPinned;

  // Click handlers with smooth animations
  const handleEngagementTrendsClick = () => {
    if (isEngagementTrendsPinned) {
      setIsEngagementTrendsPinned(false);
      setIsEngagementTrendsCollapsed(true);
    } else {
      setIsEngagementTrendsPinned(true);
      setIsEngagementTrendsCollapsed(false);
    }
  };

  const handleContentInsightsClick = () => {
    if (isContentInsightsPinned) {
      setIsContentInsightsPinned(false);
      setIsContentInsightsCollapsed(true);
    } else {
      setIsContentInsightsPinned(true);
      setIsContentInsightsCollapsed(false);
    }
  };

  const handleTopPostsClick = () => {
    if (isTopPostsPinned) {
      setIsTopPostsPinned(false);
      setIsTopPostsCollapsed(true);
    } else {
      setIsTopPostsPinned(true);
      setIsTopPostsCollapsed(false);
    }
  };

  const handleActivityTimelineClick = () => {
    if (isActivityTimelinePinned) {
      setIsActivityTimelinePinned(false);
      setIsActivityTimelineCollapsed(true);
    } else {
      setIsActivityTimelinePinned(true);
      setIsActivityTimelineCollapsed(false);
    }
  };

  const handleVisitorAnalyticsClick = () => {
    if (isVisitorAnalyticsPinned) {
      setIsVisitorAnalyticsPinned(false);
      setIsVisitorAnalyticsCollapsed(true);
    } else {
      setIsVisitorAnalyticsPinned(true);
      setIsVisitorAnalyticsCollapsed(false);
    }
  };

  useEffect(() => {
    generateTimeSeriesData();
  }, [posts, comments, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadVisitorAnalytics();
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVisitorAnalytics = async () => {
    try {
      setLoadingVisitorData(true);
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      
      const [visitors, summary] = await Promise.all([
        getVisitorAnalytics({ limit: 100 }),
        getAnalyticsSummary(days)
      ]);
      
      setVisitorData(visitors);
      setVisitorSummary(summary);
    } catch (error) {
      console.error('Error loading visitor analytics:', error);
    } finally {
      setLoadingVisitorData(false);
    }
  };

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
      {/* Modern Header with Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/5 dark:to-purple-400/5"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 lg:gap-8">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl lg:rounded-2xl blur-lg opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 lg:p-3 rounded-xl lg:rounded-2xl">
                    <Sparkles className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg font-medium">
                    Real-time insights & performance metrics
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              {[
                { value: '7d', label: '7D', icon: Calendar, color: 'from-emerald-500 to-teal-600' },
                { value: '30d', label: '30D', icon: Calendar, color: 'from-blue-500 to-cyan-600' },
                { value: '90d', label: '90D', icon: Calendar, color: 'from-purple-500 to-pink-600' },
                { value: '1y', label: '1Y', icon: Calendar, color: 'from-orange-500 to-red-600' }
              ].map((option) => {
                const Icon = option.icon;
                const isActive = timeRange === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTimeRange(option.value as '7d' | '30d' | '90d' | '1y')}
                    className={`group relative flex items-center gap-1.5 lg:gap-2 px-3 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 min-h-[44px] ${
                      isActive
                        ? `bg-gradient-to-r ${option.color} text-white shadow-lg shadow-blue-500/25`
                        : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 shadow-md backdrop-blur-sm border border-white/50 dark:border-gray-600/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'rotate-12' : 'group-hover:rotate-6'}`} />
                    {option.label}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl lg:rounded-2xl"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {[
          {
            title: 'Total Posts',
            value: metrics.totalPosts,
            change: metrics.recentPosts,
            changeLabel: 'this week',
            icon: BarChart3,
            gradient: 'from-blue-500 via-blue-600 to-blue-700',
            bgGradient: 'from-blue-50 to-blue-100',
            darkBgGradient: 'from-blue-950/50 to-blue-900/50',
            changeColor: 'text-blue-700 dark:text-blue-300',
            changeBg: 'bg-blue-100 dark:bg-blue-900/30'
          },
          {
            title: 'Total Comments',
            value: metrics.totalComments,
            change: metrics.recentComments,
            changeLabel: 'this week',
            icon: MessageSquare,
            gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
            bgGradient: 'from-emerald-50 to-emerald-100',
            darkBgGradient: 'from-emerald-950/50 to-emerald-900/50',
            changeColor: 'text-emerald-700 dark:text-emerald-300',
            changeBg: 'bg-emerald-100 dark:bg-emerald-900/30'
          },
          {
            title: 'Total Reactions',
            value: metrics.totalReactions,
            change: metrics.recentReactions,
            changeLabel: 'this week',
            icon: Heart,
            gradient: 'from-rose-500 via-rose-600 to-rose-700',
            bgGradient: 'from-rose-50 to-rose-100',
            darkBgGradient: 'from-rose-950/50 to-rose-900/50',
            changeColor: 'text-rose-700 dark:text-rose-300',
            changeBg: 'bg-rose-100 dark:bg-rose-900/30'
          },
          {
            title: 'Engagement Rate',
            value: `${metrics.engagementRate}%`,
            change: metrics.avgEngagementPerPost,
            changeLabel: 'avg per post',
            icon: TrendingUp,
            gradient: 'from-purple-500 via-purple-600 to-purple-700',
            bgGradient: 'from-purple-50 to-purple-100',
            darkBgGradient: 'from-purple-950/50 to-purple-900/50',
            changeColor: 'text-purple-700 dark:text-purple-300',
            changeBg: 'bg-purple-100 dark:bg-purple-900/30'
          }
                  ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div 
                key={index} 
                className={`group relative overflow-hidden bg-gradient-to-br ${metric.bgGradient} dark:${metric.darkBgGradient} backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 lg:hover:-translate-y-2 hover:scale-[1.02]`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <div className="relative p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-4 lg:mb-6">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${metric.gradient} rounded-xl lg:rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                      <div className={`relative bg-gradient-to-r ${metric.gradient} p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
                        {metric.value}
                      </p>
                      <p className="text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {metric.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className={`flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-full ${metric.changeBg} backdrop-blur-sm`}>
                      <TrendingUp className={`h-3 w-3 lg:h-4 lg:w-4 ${metric.changeColor}`} />
                      <span className={`text-xs lg:text-sm font-bold ${metric.changeColor}`}>
                        +{metric.change}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {metric.changeLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Modern Engagement Trends */}
      <div 
        className="group relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-gray-800 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl lg:rounded-3xl shadow-lg border border-white/50 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500"
        onMouseEnter={() => setIsEngagementTrendsHovered(true)}
        onMouseLeave={() => setIsEngagementTrendsHovered(false)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-transparent"></div>
        <div className="relative p-4 lg:p-6">
          <button
            onClick={handleEngagementTrendsClick}
            className="w-full flex items-center justify-between mb-4 lg:mb-6 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl lg:rounded-2xl p-3 lg:p-4 -m-2 transition-all duration-300 group/button min-h-[44px]"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg lg:rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-2.5 lg:p-3 rounded-lg lg:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Engagement Trends
                </h3>
                {isEngagementTrendsPinned && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 lg:px-3 py-1 rounded-full font-medium mt-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Pinned
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {shouldShowEngagementTrends ? (
                <ChevronUp className="h-5 w-5 text-gray-500 group-hover/button:text-indigo-600 transition-colors duration-300" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 group-hover/button:text-indigo-600 transition-colors duration-300" />
              )}
            </div>
          </button>
          <div 
            ref={engagementTrendsRef}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              shouldShowEngagementTrends ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0'
            }`}
            style={{
              height: shouldShowEngagementTrends ? 'auto' : '0px'
            }}
          >
            {shouldShowEngagementTrends && (
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
        )}
      </div>

      {/* Content Insights */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        onMouseEnter={() => setIsContentInsightsHovered(true)}
        onMouseLeave={() => setIsContentInsightsHovered(false)}
      >
        <button
          onClick={handleContentInsightsClick}
          className="w-full flex items-center justify-between mb-6 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Target className="h-6 w-6 text-orange-600" />
            Content Insights & Analysis
            {isContentInsightsPinned && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
                Pinned
              </span>
            )}
          </h3>
          {shouldShowContentInsights ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {shouldShowContentInsights && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Content Insights
              </h4>
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
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Mood Distribution
              </h4>
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
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-emerald-600" />
                Top Tags
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {tagAnalytics.slice(0, 8).map(({ tag, count, percentage, avgEngagement }) => (
                  <div key={tag} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
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
        )}
      </div>

      {/* Enhanced Top Performing Posts */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        onMouseEnter={() => setIsTopPostsHovered(true)}
        onMouseLeave={() => setIsTopPostsHovered(false)}
      >
        <button
          onClick={handleTopPostsClick}
          className="w-full flex items-center justify-between mb-6 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Star className="h-6 w-6 text-yellow-600" />
            Top Performing Posts
            {isTopPostsPinned && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full">
                Pinned
              </span>
            )}
          </h3>
          {shouldShowTopPosts ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {shouldShowTopPosts && (
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
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        onMouseEnter={() => setIsActivityTimelineHovered(true)}
        onMouseLeave={() => setIsActivityTimelineHovered(false)}
      >
        <button
          onClick={handleActivityTimelineClick}
          className="w-full flex items-center justify-between mb-6 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Clock className="h-6 w-6 text-indigo-600" />
            Activity Timeline ({timeRange})
            {isActivityTimelinePinned && (
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                Pinned
              </span>
            )}
          </h3>
          {shouldShowActivityTimeline ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {shouldShowActivityTimeline && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
        )}
      </div>

      {/* Visitor Analytics Section */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        onMouseEnter={() => setIsVisitorAnalyticsHovered(true)}
        onMouseLeave={() => setIsVisitorAnalyticsHovered(false)}
      >
        <button
          onClick={handleVisitorAnalyticsClick}
          className="w-full flex items-center justify-between mb-6 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Globe className="h-6 w-6 text-blue-600" />
            Visitor Analytics
            {isVisitorAnalyticsPinned && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                Pinned
              </span>
            )}
          </h3>
          {shouldShowVisitorAnalytics ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {shouldShowVisitorAnalytics && (
          <div>
            {loadingVisitorData ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : visitorSummary ? (
          <div className="space-y-6">
            {/* Visitor Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8" />
                  <div>
                    <p className="text-blue-100 text-sm">Total Visits</p>
                    <p className="text-2xl font-bold">{visitorSummary.totalVisits}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8" />
                  <div>
                    <p className="text-green-100 text-sm">Unique Visitors</p>
                    <p className="text-2xl font-bold">{visitorSummary.uniqueVisitors}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8" />
                  <div>
                    <p className="text-purple-100 text-sm">Top Page</p>
                    <p className="text-lg font-bold truncate">
                      {visitorSummary.topPages[0]?.page || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8" />
                  <div>
                    <p className="text-orange-100 text-sm">Top Country</p>
                    <p className="text-lg font-bold truncate">
                      {visitorSummary.topCountries[0]?.country || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Pages, Countries, and Cities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Top Pages</h4>
                <div className="space-y-2">
                  {visitorSummary.topPages.slice(0, 5).map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium truncate">
                          {page.page === '/' ? 'Home' : page.page}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{page.visits}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Top Countries</h4>
                <div className="space-y-2">
                  {visitorSummary.topCountries.slice(0, 5).map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">{country.country}</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">{country.visits}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Top Cities</h4>
                <div className="space-y-2">
                  {visitorSummary.topCities.slice(0, 5).map((city, index) => (
                    <div key={city.city} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">{city.city}</span>
                      </div>
                      <span className="text-sm font-semibold text-purple-600">{city.visits}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Visitors */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Visitors</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {visitorData.slice(0, 10).map((visitor, index) => (
                  <div key={visitor.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {visitor.city || 'Unknown'}, {visitor.country || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {visitor.page} • {visitor.isp || 'Unknown ISP'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                            IP: {visitor.ipAddress || 'Unknown'}
                          </p>
                          {visitor.ipVersion && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              visitor.ipVersion === 'IPv4' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              visitor.ipVersion === 'IPv6' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              visitor.ipVersion === 'Both' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {visitor.ipVersion}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(visitor.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(visitor.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Visitor Table */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Detailed Visitor Log</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Primary IP</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">IPv4</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">IPv6</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Version</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Location</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">ISP</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Page</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorData.slice(0, 20).map((visitor, index) => (
                      <tr key={visitor.id || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">
                          {visitor.ipAddress || 'Unknown'}
                        </td>
                        <td className="py-2 px-3 font-mono text-green-600 dark:text-green-400">
                          {visitor.ipv4Address || '-'}
                        </td>
                        <td className="py-2 px-3 font-mono text-purple-600 dark:text-purple-400">
                          {visitor.ipv6Address || '-'}
                        </td>
                        <td className="py-2 px-3">
                          {visitor.ipVersion && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              visitor.ipVersion === 'IPv4' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              visitor.ipVersion === 'IPv6' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              visitor.ipVersion === 'Both' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {visitor.ipVersion}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-gray-900 dark:text-white">
                          {visitor.city || 'Unknown'}, {visitor.country || 'Unknown'}
                        </td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                          {visitor.isp || 'Unknown'}
                        </td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                          {visitor.page === '/' ? 'Home' : visitor.page}
                        </td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                          {new Date(visitor.timestamp).toLocaleDateString()} {new Date(visitor.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visitorData.length > 20 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Showing 20 of {visitorData.length} visitors
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No visitor data available</p>
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
} 