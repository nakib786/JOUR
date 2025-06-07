'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostCard } from '@/components/PostCard';
import { FilterPanel } from '@/components/FilterPanel';
import { Post, FilterOptions } from '@/types';
import { Heart, Calendar, Tag, Loader2, ChevronRight, ArrowRight } from 'lucide-react';
import { getPosts } from '@/lib/firebase/firestore';
import { AnimatedLogo } from '@/components/AnimatedLogo';

// Feature badge component
const FeatureBadge = ({ icon, text, delay = 0 }: { icon: React.ReactNode, text: string, delay?: number }) => {
  return (
    <motion.div
      className="inline-flex items-center rounded-full border border-rose-200/30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 text-sm gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0 0 25px rgba(244, 63, 94, 0.3)",
        borderColor: "rgba(244, 63, 94, 0.5)"
      }}
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <span className="font-medium">{text}</span>
    </motion.div>
  );
};



export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    tags: [],
    dateRange: { start: null, end: null },
    searchQuery: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load posts from Firebase
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setError(null);
        const fetchedPosts = await getPosts({ limitCount: 50 });
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try again later.');
        // Fallback to mock data if Firebase fails
        const mockPosts: Post[] = [
          {
            id: '1',
            title: 'Finding Light in Dark Times',
            content: 'Today was one of those days where everything felt overwhelming. The weight of expectations, the constant noise of the world, and my own inner critic seemed to gang up on me. But then I remembered something my grandmother used to say: "Even the darkest night will end and the sun will rise." I decided to take a walk in the park, and there I saw a small flower pushing through a crack in the concrete. It reminded me that resilience isn\'t about being strong all the time—it\'s about finding ways to grow even in the most unlikely places. #healing #hope #resilience',
            date: new Date('2024-01-15'),
            tags: ['healing', 'hope', 'resilience'],
            reactions: { like: 24, love: 8, laugh: 5, wow: 12, sad: 2, angry: 1 },
            mood: 'hopeful',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
            shareCount: 12,
            commentCount: 8,
          },
          {
            id: '2',
            title: 'The Panic Attack That Taught Me Self-Compassion',
            content: 'I had a panic attack in the grocery store today. My heart was racing, my palms were sweaty, and I felt like I couldn\'t breathe. The old me would have been so angry at myself, calling myself weak and pathetic. But today, I tried something different. I spoke to myself like I would speak to a dear friend. "It\'s okay," I whispered. "You\'re safe. This will pass." And it did. I\'m learning that healing isn\'t linear, and that\'s okay. Some days we soar, some days we stumble, and both are part of the human experience. #panicattack #selfcompassion #mentalhealth',
            date: new Date('2024-01-14'),
            tags: ['panicattack', 'selfcompassion', 'mentalhealth'],
            reactions: { like: 45, love: 32, laugh: 15, wow: 28, sad: 8, angry: 3 },
            mood: 'vulnerable',
            createdAt: new Date('2024-01-14'),
            updatedAt: new Date('2024-01-14'),
            shareCount: 25,
            commentCount: 15,
          },
          {
            id: '3',
            title: 'Small Wins Matter',
            content: 'I made my bed today. I know it sounds silly, but for someone who\'s been struggling with depression, making the bed feels like climbing a mountain. I also watered my plants, replied to a friend\'s text, and took a shower. These might seem like basic things to most people, but for me, they\'re victories. I\'m learning to celebrate the small wins because they add up to something bigger. Progress isn\'t always dramatic—sometimes it\'s just showing up for yourself in the smallest ways. #wins #depression #progress #selfcare',
            date: new Date('2024-01-13'),
            tags: ['wins', 'depression', 'progress', 'selfcare'],
            reactions: { like: 78, love: 25, laugh: 12, wow: 18, sad: 4, angry: 2 },
            mood: 'proud',
            createdAt: new Date('2024-01-13'),
            updatedAt: new Date('2024-01-13'),
            shareCount: 34,
            commentCount: 22,
          },
        ];
        setPosts(mockPosts);
        setFilteredPosts(mockPosts);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = posts;

    // Filter by tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(post =>
        filters.tags.some(tag => post.tags.includes(tag))
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))
      );
    }

    // Filter by date range
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(post =>
        post.date >= filters.dateRange.start! && post.date <= filters.dateRange.end!
      );
    }

    setFilteredPosts(filtered);
  }, [filters, posts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-16 w-16 text-rose-500 mx-auto mb-6" />
          </motion.div>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading inspiring stories...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-rose-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
                         {/* Logo and sparkles */}
             <div className="flex justify-center mb-8">
               <AnimatedLogo size="large" showText={false} />
             </div>
            
            {/* Main heading with gradient animation */}
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span 
                className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                Kahani Roz
              </motion.span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.h2 
              className="text-2xl md:text-4xl text-gray-700 dark:text-gray-200 mb-8 font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              A Story Every Day
            </motion.h2>
            
            {/* Description */}
            <motion.p 
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Share inspiring, raw, real-life journal entries. Connect through stories that reflect hope, struggle, and truth. 
              Every story matters. Every voice deserves to be heard.
            </motion.p>

            {/* Feature badges */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <FeatureBadge 
                icon={<Calendar className="h-5 w-5 text-rose-500" />} 
                text="Daily Stories" 
                delay={0.1}
              />
              <FeatureBadge 
                icon={<Tag className="h-5 w-5 text-rose-500" />} 
                text="Filter by Tags" 
                delay={0.2}
              />
              <FeatureBadge 
                icon={<Heart className="h-5 w-5 text-rose-500" />} 
                text="Anonymous Reactions" 
                delay={0.3}
              />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.button
                className="group bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Reading
                <motion.div
                  className="group-hover:translate-x-1 transition-transform duration-300"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </motion.button>
              
              <motion.button
                className="group border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Categories
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>

          
        </div>
      </section>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Toggle */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className="group flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: showFilters ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tag className="h-5 w-5 text-rose-500" />
          </motion.div>
          <span className="font-medium">Filters</span>
          {filters.tags.length > 0 && (
            <motion.span 
              className="bg-rose-500 text-white text-sm px-3 py-1 rounded-full font-medium"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              {filters.tags.length}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <FilterPanel filters={filters} onFiltersChange={setFilters} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts Feed */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4">
                No stories found
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-lg">
                Try adjusting your filters or check back later for new stories.
              </p>
                         </motion.div>
           )}
         </motion.div>
      </section>
    </div>
  );
}
