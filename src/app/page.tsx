'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostCard } from '@/components/PostCard';
import { FilterPanel } from '@/components/FilterPanel';
import { Pagination } from '@/components/Pagination';
import { Post, FilterOptions } from '@/types';
import { Heart, Calendar, Tag, Loader2, ArrowRight } from 'lucide-react';
import { getPosts } from '@/lib/firebase/firestore';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { trackPageVisit } from '@/lib/analytics';

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
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;

  // Load posts from Firebase
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setError(null);
        const fetchedPosts = await getPosts({ limitCount: 50 });
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts);
        
        // Track page visit
        trackPageVisit('/');
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
          {
            id: '4',
            title: 'Learning to Say No',
            content: 'I finally said no to a social event today, and I don\'t feel guilty about it. For years, I\'ve been a people pleaser, saying yes to everything even when I was exhausted. Tonight, when my friend invited me to a party, I politely declined and explained that I needed some quiet time. Instead of feeling bad, I felt empowered. I\'m learning that saying no to others sometimes means saying yes to myself. #boundaries #selfcare #growth',
            date: new Date('2024-01-12'),
            tags: ['boundaries', 'selfcare', 'growth'],
            reactions: { like: 56, love: 18, laugh: 3, wow: 22, sad: 1, angry: 0 },
            mood: 'proud',
            createdAt: new Date('2024-01-12'),
            updatedAt: new Date('2024-01-12'),
            shareCount: 19,
            commentCount: 12,
          },
          {
            id: '5',
            title: 'The Art of Being Alone',
            content: 'Spent the entire weekend by myself and it was exactly what I needed. No plans, no obligations, just me and my thoughts. I cooked my favorite meal, read a book, and watched the sunset from my window. There\'s something beautiful about enjoying your own company. Solitude isn\'t loneliness—it\'s a gift you give yourself. #solitude #mindfulness #peace',
            date: new Date('2024-01-11'),
            tags: ['solitude', 'mindfulness', 'peace'],
            reactions: { like: 89, love: 34, laugh: 7, wow: 15, sad: 3, angry: 1 },
            mood: 'peaceful',
            createdAt: new Date('2024-01-11'),
            updatedAt: new Date('2024-01-11'),
            shareCount: 28,
            commentCount: 18,
          },
          {
            id: '6',
            title: 'When Anxiety Visits',
            content: 'Anxiety knocked on my door again today. Instead of fighting it or pretending it wasn\'t there, I invited it in for tea. "What are you trying to tell me?" I asked. It spoke about upcoming deadlines, unfinished projects, and the fear of not being enough. I listened without judgment, acknowledged its concerns, and then gently showed it the door. Sometimes the best way to deal with anxiety is to hear what it has to say. #anxiety #mentalhealth #acceptance',
            date: new Date('2024-01-10'),
            tags: ['anxiety', 'mentalhealth', 'acceptance'],
            reactions: { like: 67, love: 41, laugh: 2, wow: 28, sad: 12, angry: 0 },
            mood: 'vulnerable',
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-10'),
            shareCount: 31,
            commentCount: 24,
          },
          {
            id: '7',
            title: 'Gratitude in the Mundane',
            content: 'Today I found magic in the ordinary. The way morning light filtered through my curtains, the smell of coffee brewing, the sound of rain against my window. These small moments often go unnoticed, but they\'re the threads that weave the fabric of our days. I\'m learning to find gratitude not just in the big moments, but in the quiet, everyday miracles that surround us. #gratitude #mindfulness #presence',
            date: new Date('2024-01-09'),
            tags: ['gratitude', 'mindfulness', 'presence'],
            reactions: { like: 92, love: 38, laugh: 5, wow: 19, sad: 2, angry: 0 },
            mood: 'grateful',
            createdAt: new Date('2024-01-09'),
            updatedAt: new Date('2024-01-09'),
            shareCount: 42,
            commentCount: 16,
          },
          {
            id: '8',
            title: 'The Weight of Perfectionism',
            content: 'I spent three hours rewriting a simple email today because it didn\'t feel "perfect." Then I realized—perfectionism isn\'t about excellence, it\'s about fear. Fear of judgment, fear of failure, fear of not being enough. I hit send on that imperfect email and felt a weight lift off my shoulders. Done is better than perfect, and progress is better than paralysis. #perfectionism #growth #courage',
            date: new Date('2024-01-08'),
            tags: ['perfectionism', 'growth', 'courage'],
            reactions: { like: 73, love: 29, laugh: 8, wow: 31, sad: 6, angry: 1 },
            mood: 'reflective',
            createdAt: new Date('2024-01-08'),
            updatedAt: new Date('2024-01-08'),
            shareCount: 26,
            commentCount: 20,
          },
          {
            id: '9',
            title: 'Dancing in the Kitchen',
            content: 'Put on my favorite song while cooking dinner and ended up having a full dance party in my kitchen. My neighbors probably think I\'m crazy, but I don\'t care. There\'s something liberating about moving your body to music, about letting joy take over even in the most ordinary moments. Sometimes the best therapy is a good song and the freedom to be silly. #joy #music #freedom',
            date: new Date('2024-01-07'),
            tags: ['joy', 'music', 'freedom'],
            reactions: { like: 85, love: 52, laugh: 23, wow: 14, sad: 1, angry: 0 },
            mood: 'joyful',
            createdAt: new Date('2024-01-07'),
            updatedAt: new Date('2024-01-07'),
            shareCount: 35,
            commentCount: 13,
          },
          {
            id: '10',
            title: 'The Courage to Begin Again',
            content: 'Started journaling again after months of silence. My pen felt foreign in my hand, and the words came slowly at first. But with each sentence, I remembered why I loved this practice. Writing isn\'t just about recording events—it\'s about making sense of them, finding patterns, discovering truths. Every day is a chance to begin again, to pick up the pen and continue your story. #writing #courage #newbeginnings',
            date: new Date('2024-01-06'),
            tags: ['writing', 'courage', 'newbeginnings'],
            reactions: { like: 64, love: 27, laugh: 4, wow: 18, sad: 3, angry: 0 },
            mood: 'hopeful',
            createdAt: new Date('2024-01-06'),
            updatedAt: new Date('2024-01-06'),
            shareCount: 22,
            commentCount: 11,
          },
          {
            id: '11',
            title: 'Lessons from a Broken Phone',
            content: 'Dropped my phone today and the screen shattered into a spider web of cracks. My first instinct was frustration, but then I saw something beautiful in those fractures. They reminded me that broken things can still function, still serve their purpose. Maybe we\'re all a little cracked, and maybe that\'s okay. Our imperfections don\'t make us worthless—they make us human. #acceptance #imperfection #resilience',
            date: new Date('2024-01-05'),
            tags: ['acceptance', 'imperfection', 'resilience'],
            reactions: { like: 71, love: 33, laugh: 6, wow: 25, sad: 4, angry: 0 },
            mood: 'reflective',
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-05'),
            shareCount: 29,
            commentCount: 17,
          },
          {
            id: '12',
            title: 'The Gift of Forgiveness',
            content: 'Forgave myself today for a mistake I made years ago. It\'s funny how we can forgive others so easily but hold ourselves to impossible standards. I wrote myself a letter of forgiveness, acknowledging the hurt while also recognizing my growth. Forgiveness isn\'t about forgetting—it\'s about freeing yourself from the weight of the past. #forgiveness #selfcompassion #healing',
            date: new Date('2024-01-04'),
            tags: ['forgiveness', 'selfcompassion', 'healing'],
            reactions: { like: 88, love: 45, laugh: 2, wow: 21, sad: 7, angry: 0 },
            mood: 'peaceful',
            createdAt: new Date('2024-01-04'),
            updatedAt: new Date('2024-01-04'),
            shareCount: 38,
            commentCount: 25,
          },
          {
            id: '13',
            title: 'Finding Strength in Vulnerability',
            content: 'Shared something deeply personal with a friend today and was met with understanding instead of judgment. It reminded me that vulnerability isn\'t weakness—it\'s the birthplace of connection. When we have the courage to show our true selves, we give others permission to do the same. The walls we build to protect ourselves often become the very things that isolate us. #vulnerability #connection #courage',
            date: new Date('2024-01-03'),
            tags: ['vulnerability', 'connection', 'courage'],
            reactions: { like: 76, love: 39, laugh: 3, wow: 27, sad: 5, angry: 0 },
            mood: 'vulnerable',
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-03'),
            shareCount: 33,
            commentCount: 19,
          },
          {
            id: '14',
            title: 'The Beauty of Slow Mornings',
            content: 'Woke up early today not because I had to, but because I wanted to. Sat with my coffee and watched the world wake up slowly. No rushing, no agenda, just presence. There\'s something sacred about the quiet hours of morning, before the world demands your attention. I\'m learning that how you start your day sets the tone for everything that follows. #mornings #mindfulness #peace',
            date: new Date('2024-01-02'),
            tags: ['mornings', 'mindfulness', 'peace'],
            reactions: { like: 94, love: 41, laugh: 4, wow: 16, sad: 1, angry: 0 },
            mood: 'peaceful',
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
            shareCount: 45,
            commentCount: 21,
          },
          {
            id: '15',
            title: 'New Year, Same Me (And That\'s Okay)',
            content: 'January 1st came and went, and I\'m still the same person with the same struggles and the same dreams. No magical transformation, no sudden clarity. And you know what? That\'s perfectly fine. Growth isn\'t about becoming someone new—it\'s about becoming more of who you already are. This year, I\'m not making resolutions. I\'m making peace with the journey. #newyear #selfacceptance #growth',
            date: new Date('2024-01-01'),
            tags: ['newyear', 'selfacceptance', 'growth'],
            reactions: { like: 102, love: 48, laugh: 7, wow: 23, sad: 3, angry: 0 },
            mood: 'reflective',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            shareCount: 51,
            commentCount: 28,
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
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filters, posts]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of posts section
    const postsSection = document.getElementById('posts-section');
    if (postsSection) {
      postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
              <motion.div
                className="inline-flex items-center rounded-full border border-rose-200/30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 text-sm gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 25px rgba(244, 63, 94, 0.3)",
                  borderColor: "rgba(244, 63, 94, 0.5)"
                }}
              >
                <motion.div
                  whileHover={{ 
                    scale: [1, 1.3, 1.1, 1.3, 1],
                    rotate: [0, -10, 10, -5, 0]
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                >
                  <Heart className="h-5 w-5 text-rose-500" />
                </motion.div>
                <span className="font-medium">Anonymous Reactions</span>
              </motion.div>
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              className="flex justify-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.button
                onClick={() => {
                  const postsSection = document.getElementById('posts-section');
                  if (postsSection) {
                    postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
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
      <section id="posts-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Posts Count and Page Info */}
        {filteredPosts.length > 0 && (
          <motion.div 
            className="flex items-center justify-between mb-8 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-rose-600 dark:text-rose-400">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-rose-600 dark:text-rose-400">{Math.min(endIndex, filteredPosts.length)}</span> of{' '}
              <span className="font-semibold text-rose-600 dark:text-rose-400">{filteredPosts.length}</span> stories
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold text-rose-600 dark:text-rose-400">{currentPage}</span> of{' '}
              <span className="font-semibold text-rose-600 dark:text-rose-400">{totalPages}</span>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          key={currentPage} // Re-animate when page changes
        >
          {filteredPosts.length > 0 ? (
            currentPosts.map((post, index) => (
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

        {/* Pagination */}
        {filteredPosts.length > postsPerPage && (
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mb-8"
            />
          </motion.div>
        )}
      </section>
    </div>
  );
}
