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
  moveCommentToTrash,
  syncAllCommentCounts,
  syncAllReactionCounts,
  createAuthorReply
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
  Activity,
  Menu,
  X,
  Clock,
  Mic,
  MicOff,
  AlertCircle,
  Sparkles,
  Settings,
  RefreshCw,
  Reply,
  Send
} from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { AuthTurnstile, type AuthTurnstileRef } from '@/components/AuthTurnstile';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatRichText } from '@/lib/richTextFormatter';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);



// Speech Recognition Interfaces
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type AdminTab = 'dashboard' | 'posts' | 'comments' | 'analytics' | 'create' | 'trash';

// AI Analysis Functions
const detectMoodFromText = (text: string): string => {
  const moodKeywords = {
    hopeful: [
      'hope', 'hopeful', 'future', 'dream', 'aspire', 'optimistic', 'positive', 'bright', 'tomorrow', 'better', 'improve', 'progress', 'forward', 'believe', 'faith', 'confidence', 'possibility', 'potential',
      'आशा', 'उम्मीद', 'सपना', 'भविष्य', 'बेहतर', 'सुधार', 'प्रगति', 'विश्वास', 'संभावना'
    ],
    grateful: [
      'thank', 'thanks', 'grateful', 'gratitude', 'appreciate', 'appreciation', 'blessed', 'blessing', 'fortunate', 'thankful', 'grace', 'lucky', 'privilege', 'gift', 'abundance',
      'धन्यवाद', 'आभार', 'कृतज्ञ', 'शुक्रगुजार', 'भाग्यशाली', 'खुशकिस्मत', 'वरदान', 'उपहार'
    ],
    reflective: [
      'think', 'thinking', 'thought', 'reflect', 'reflection', 'consider', 'ponder', 'contemplate', 'realize', 'realization', 'understand', 'understanding', 'insight', 'perspective', 'wonder', 'question', 'meaning', 'purpose', 'deep', 'profound',
      'सोचना', 'विचार', 'समझना', 'एहसास', 'अनुभव', 'गहरा', 'मतलब', 'उद्देश्य', 'चिंतन', 'मनन'
    ],
    happy: [
      'happy', 'happiness', 'joy', 'joyful', 'smile', 'smiling', 'laugh', 'laughing', 'excited', 'excitement', 'cheerful', 'delighted', 'pleased', 'content', 'satisfied', 'elated', 'thrilled', 'amazing', 'wonderful', 'fantastic', 'great', 'awesome', 'love', 'loving', 'celebration', 'celebrate',
      'खुश', 'खुशी', 'प्रसन्न', 'आनंद', 'हंसी', 'मुस्कान', 'उत्साह', 'उत्सव', 'मजा', 'अच्छा', 'बेहतरीन', 'शानदार', 'प्रेम', 'प्यार'
    ],
    sad: [
      'sad', 'sadness', 'cry', 'crying', 'tears', 'sorrow', 'grief', 'hurt', 'hurting', 'pain', 'painful', 'heartbreak', 'broken', 'lonely', 'loneliness', 'empty', 'lost', 'miss', 'missing', 'regret', 'disappointed', 'disappointment', 'depressed', 'depression', 'down', 'low',
      'उदास', 'दुख', 'दुखी', 'गम', 'रोना', 'आंसू', 'दर्द', 'पीड़ा', 'अकेला', 'खाली', 'टूटा', 'निराश', 'अवसाद'
    ],
    anxious: [
      'worry', 'worried', 'worrying', 'anxious', 'anxiety', 'nervous', 'nervousness', 'stress', 'stressed', 'stressful', 'fear', 'fearful', 'afraid', 'scared', 'panic', 'concerned', 'concern', 'tension', 'tense', 'overwhelmed', 'pressure', 'uncertain', 'uncertainty', 'doubt', 'doubtful',
      'चिंता', 'चिंतित', 'परेशान', 'डर', 'डरा', 'भय', 'घबराहट', 'तनाव', 'दबाव', 'संदेह', 'अनिश्चितता'
    ],
    angry: [
      'angry', 'anger', 'mad', 'furious', 'rage', 'frustrated', 'frustration', 'annoyed', 'annoying', 'irritated', 'irritating', 'upset', 'outraged', 'livid', 'hate', 'hatred', 'disgusted', 'fed up', 'sick of', 'can\'t stand',
      'गुस्सा', 'गुस्से', 'क्रोध', 'क्रोधित', 'नाराज', 'चिढ़', 'परेशान', 'झुंझलाहट', 'नफरत', 'घृणा'
    ],
    nostalgic: [
      'remember', 'remembering', 'memory', 'memories', 'nostalgia', 'nostalgic', 'childhood', 'past', 'old', 'before', 'used to', 'back then', 'those days', 'miss', 'missing', 'reminisce', 'flashback', 'throwback', 'vintage', 'classic',
      'यादें', 'याद', 'पुराना', 'बचपन', 'अतीत', 'पहले', 'उस समय', 'स्मृति', 'पुराने दिन'
    ],
    vulnerable: [
      'vulnerable', 'weakness', 'weak', 'fragile', 'sensitive', 'exposed', 'open', 'raw', 'honest', 'confession', 'admit', 'struggle', 'struggling', 'difficult', 'hard', 'tough', 'challenge', 'challenging',
      'कमजोर', 'नाजुक', 'संवेदनशील', 'कठिन', 'मुश्किल', 'संघर्ष', 'चुनौती', 'सच्चाई'
    ],
    proud: [
      'proud', 'pride', 'achievement', 'accomplish', 'accomplished', 'success', 'successful', 'victory', 'win', 'won', 'triumph', 'overcome', 'conquered', 'earned', 'deserve', 'deserved', 'milestone', 'breakthrough',
      'गर्व', 'गर्वित', 'सफलता', 'जीत', 'विजय', 'उपलब्धि', 'कामयाबी', 'हासिल', 'मील का पत्थर'
    ]
  };

  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = cleanText.split(/\s+/).filter(word => word.length > 2);
  const moodScores: Record<string, number> = {};

  // Initialize scores
  Object.keys(moodKeywords).forEach(mood => {
    moodScores[mood] = 0;
  });

  // Calculate weighted scores
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    for (const keyword of keywords) {
      for (const word of words) {
        if (word.includes(keyword) || keyword.includes(word)) {
          // Exact match gets higher score
          if (word === keyword) {
            moodScores[mood] += 3;
          } else if (word.includes(keyword) || keyword.includes(word)) {
            moodScores[mood] += 1;
          }
        }
      }
    }
  }

  // Find the mood with highest score
  const sortedMoods = Object.entries(moodScores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);

  return sortedMoods.length > 0 ? sortedMoods[0][0] : '';
};

const extractTagsFromText = (text: string): string[] => {
  const tagKeywords = {
    // Specific tags instead of categories
    love: ['love', 'loving', 'romance', 'romantic', 'relationship', 'partner', 'boyfriend', 'girlfriend', 'husband', 'wife', 'प्रेम', 'प्यार', 'मोहब्बत', 'रिश्ता'],
    family: ['family', 'mother', 'father', 'mom', 'dad', 'parent', 'parents', 'child', 'children', 'son', 'daughter', 'brother', 'sister', 'परिवार', 'माता', 'पिता', 'बच्चे', 'भाई', 'बहन'],
    friends: ['friend', 'friends', 'friendship', 'buddy', 'pal', 'companion', 'दोस्त', 'मित्र', 'दोस्ती', 'मित्रता'],
    work: ['work', 'job', 'career', 'office', 'business', 'professional', 'colleague', 'boss', 'employee', 'काम', 'नौकरी', 'व्यवसाय', 'ऑफिस'],
    health: ['health', 'healthy', 'sick', 'illness', 'doctor', 'hospital', 'medicine', 'exercise', 'fitness', 'स्वास्थ्य', 'बीमारी', 'डॉक्टर', 'अस्पताल', 'दवा'],
    travel: ['travel', 'trip', 'journey', 'vacation', 'holiday', 'adventure', 'explore', 'visit', 'यात्रा', 'सफर', 'छुट्टी', 'घूमना'],
    education: ['school', 'college', 'university', 'study', 'student', 'teacher', 'learn', 'education', 'स्कूल', 'कॉलेज', 'पढ़ाई', 'शिक्षा', 'छात्र'],
    food: ['food', 'eat', 'cooking', 'cook', 'recipe', 'restaurant', 'meal', 'dinner', 'lunch', 'breakfast', 'खाना', 'भोजन', 'खाना बनाना', 'रेसिपी'],
    nature: ['nature', 'tree', 'trees', 'flower', 'flowers', 'garden', 'park', 'mountain', 'river', 'ocean', 'sky', 'sun', 'moon', 'rain', 'प्रकृति', 'पेड़', 'फूल', 'बगीचा', 'पहाड़', 'नदी', 'आसमान', 'सूरज', 'चांद', 'बारिश'],
    music: ['music', 'song', 'sing', 'singing', 'dance', 'dancing', 'concert', 'band', 'musician', 'संगीत', 'गाना', 'गाना गाना', 'नृत्य', 'नाचना'],
    books: ['book', 'books', 'read', 'reading', 'novel', 'story', 'author', 'library', 'किताब', 'पुस्तक', 'पढ़ना', 'कहानी', 'लेखक'],
    sports: ['sport', 'sports', 'game', 'play', 'playing', 'football', 'cricket', 'basketball', 'tennis', 'खेल', 'खेलना', 'फुटबॉल', 'क्रिकेट'],
    technology: ['computer', 'phone', 'internet', 'app', 'software', 'digital', 'online', 'website', 'कंप्यूटर', 'फोन', 'इंटरनेट', 'ऐप'],
    money: ['money', 'salary', 'income', 'expensive', 'cheap', 'buy', 'sell', 'shopping', 'पैसा', 'वेतन', 'आय', 'महंगा', 'सस्ता', 'खरीदना'],
    time: ['today', 'yesterday', 'tomorrow', 'morning', 'evening', 'night', 'weekend', 'week', 'month', 'year', 'आज', 'कल', 'सुबह', 'शाम', 'रात'],
    weather: ['weather', 'hot', 'cold', 'warm', 'cool', 'sunny', 'cloudy', 'rainy', 'मौसम', 'गर्म', 'ठंड', 'धूप', 'बादल'],
    emotions: ['happy', 'sad', 'angry', 'excited', 'nervous', 'calm', 'peaceful', 'stressed', 'खुश', 'उदास', 'गुस्सा', 'उत्साहित'],
    goals: ['goal', 'goals', 'dream', 'dreams', 'plan', 'planning', 'future', 'ambition', 'target', 'लक्ष्य', 'सपना', 'योजना', 'भविष्य'],
    memories: ['memory', 'memories', 'remember', 'childhood', 'past', 'nostalgia', 'याद', 'यादें', 'बचपन', 'अतीत'],
    celebration: ['birthday', 'anniversary', 'wedding', 'party', 'celebration', 'festival', 'holiday', 'जन्मदिन', 'शादी', 'पार्टी', 'त्योहार', 'उत्सव']
  };

  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = cleanText.split(/\s+/).filter(word => word.length > 2);
  const tagScores: Record<string, number> = {};

  // Initialize scores
  Object.keys(tagKeywords).forEach(tag => {
    tagScores[tag] = 0;
  });

  // Calculate scores
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    for (const keyword of keywords) {
      for (const word of words) {
        if (word.includes(keyword) || keyword.includes(word)) {
          if (word === keyword) {
            tagScores[tag] += 2;
          } else {
            tagScores[tag] += 1;
          }
        }
      }
    }
  }

  // Return top scoring tags
  return Object.entries(tagScores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([tag]) => tag);
};

const generateTitleFromContent = (content: string): string => {
  if (!content.trim() || content.trim().length < 10) return '';
  
  const cleanContent = content.trim();
  
  // Split into sentences
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 5);
  if (sentences.length === 0) return '';
  
  let bestSentence = sentences[0].trim();
  
  // If first sentence is too short, try to combine with second
  if (bestSentence.length < 20 && sentences.length > 1) {
    const combined = bestSentence + ' ' + sentences[1].trim();
    if (combined.length <= 60) {
      bestSentence = combined;
    }
  }
  
  // Clean and process the sentence
  let title = bestSentence
    .replace(/^(today|yesterday|tomorrow|this morning|this evening|tonight|i|me|my|we|our)\s+/i, '')
    .replace(/\s+(and|but|so|because|that|which|who|when|where|why|how)\s+.*$/i, '')
    .trim();
  
  // Take first meaningful part (up to 50 characters)
  if (title.length > 50) {
    const words = title.split(/\s+/);
    let truncated = '';
    for (const word of words) {
      if ((truncated + ' ' + word).length <= 47) {
        truncated += (truncated ? ' ' : '') + word;
      } else {
        break;
      }
    }
    title = truncated + '...';
  }
  
  // Capitalize properly
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Remove trailing punctuation except ellipsis
  title = title.replace(/[.!?]+$/, '');
  
  return title.length >= 5 ? title : '';
};

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
    mood: 'hopeful',
    date: new Date().toISOString().slice(0, 16) // Default to current date/time in YYYY-MM-DDTHH:MM format
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Edit states
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'reactions' | 'comments'>('date');
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [detectedMood, setDetectedMood] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingReactions, setIsSyncingReactions] = useState(false);
  
  // Reply states
  const [replyingToComment, setReplyingToComment] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' }
  ];

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

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = currentLanguage;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          
          if (finalTranscript.trim()) {
            setPostForm(prev => {
              const newContent = prev.content + (prev.content ? ' ' : '') + finalTranscript.trim();
              // Analyze content after state update
              setTimeout(() => analyzeContent(newContent), 100);
              return {
                ...prev, 
                content: newContent
              };
            });
            // Clear any previous errors
            setSpeechError('');
          }
        };

        recognitionRef.current.onerror = () => {
          setSpeechError('Speech recognition error. Please try again.');
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [currentLanguage]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const analyzeContent = (content: string) => {
    // Clear previous suggestions if content is too short
    if (content.trim().length < 15) {
      setDetectedMood('');
      setSuggestedTags([]);
      setSuggestedTitle('');
      return;
    }

    // Analyze mood
    const mood = detectMoodFromText(content);
    if (mood && mood !== detectedMood) {
      setDetectedMood(mood);
      // Only auto-update mood if user hasn't manually changed it
      if (postForm.mood === 'hopeful' || postForm.mood === detectedMood) {
        setPostForm(prev => ({ ...prev, mood }));
      }
    }
    
    // Analyze tags
    const tags = extractTagsFromText(content);
    if (tags.length > 0) {
      setSuggestedTags(tags);
    } else {
      setSuggestedTags([]);
    }
    
    // Generate title suggestion
    if (content.trim().length > 30) {
      const title = generateTitleFromContent(content);
      if (title && title !== suggestedTitle) {
        setSuggestedTitle(title);
      }
    }
  };

  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setSpeechError('');
      // Update language before starting
      recognitionRef.current.lang = currentLanguage;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition start error:', error);
        setSpeechError('Failed to start speech recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const addSuggestedTag = (tag: string) => {
    const currentTags = postForm.tags ? postForm.tags.split(',').map(t => t.trim()) : [];
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setPostForm(prev => ({ ...prev, tags: newTags }));
    }
  };

  const applySuggestedTitle = () => {
    if (suggestedTitle) {
      setPostForm(prev => ({ ...prev, title: suggestedTitle }));
      setSuggestedTitle('');
    }
  };

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
          date: new Date(postForm.date)
        });
      }

      // Reset form
      setPostForm({
        title: '',
        content: '',
        tags: '',
        mood: 'hopeful',
        date: new Date().toISOString().slice(0, 16)
      });

      await loadData();
      setActiveTab('posts');
      
      if (editingPost) {
        alert('Post updated successfully!');
      } else {
        const postDate = new Date(postForm.date);
        const now = new Date();
        if (postDate > now) {
          alert(`Post scheduled successfully for ${postDate.toLocaleDateString()} at ${postDate.toLocaleTimeString()}!`);
        } else if (postDate.toDateString() === now.toDateString()) {
          alert('Post published successfully!');
        } else {
          alert(`Post created successfully with date ${postDate.toLocaleDateString()}!`);
        }
      }
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
      mood: post.mood,
      date: new Date(post.createdAt).toISOString().slice(0, 16)
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

  const handleReplyToComment = (commentId: string) => {
    setReplyingToComment(commentId);
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyingToComment(null);
    setReplyText('');
  };

  const handleSubmitReply = async (commentId: string, postId: string) => {
    if (!replyText.trim() || isSubmittingReply) return;

    try {
      setIsSubmittingReply(true);
      await createAuthorReply({
        postId: postId,
        text: replyText.trim(),
        ipHash: user?.email || 'admin'
      });
      
      await loadData();
      setReplyingToComment(null);
      setReplyText('');
      alert('Reply posted successfully!');
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setIsSubmittingReply(false);
    }
  };



  // Format content for different display contexts
  const formatContentForContext = (content: string, context: 'preview' | 'full' | 'card') => {
    return formatRichText(content, { 
      allowMarkdown: true, 
      allowCustomFormatting: true,
      context
    });
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

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'create', label: 'Create Post', icon: Plus },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const handleSyncCommentCounts = async () => {
    if (!confirm('This will sync comment counts for all posts. Continue?')) {
      return;
    }

    try {
      setIsSyncing(true);
      const result = await syncAllCommentCounts();
      alert(`Comment counts synced successfully! ${result.synced} posts updated, ${result.errors} errors.`);
      await loadData(); // Reload data to show updated counts
    } catch (error) {
      console.error('Error syncing comment counts:', error);
      alert('Failed to sync comment counts. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncReactionCounts = async () => {
    if (!confirm('This will sync reaction counts for all posts. Continue?')) {
      return;
    }

    try {
      setIsSyncingReactions(true);
      const result = await syncAllReactionCounts();
      alert(`Reaction counts synced successfully! ${result.synced} posts updated, ${result.errors} errors.`);
      await loadData(); // Reload data to show updated counts
    } catch (error) {
      console.error('Error syncing reaction counts:', error);
      alert('Failed to sync reaction counts. Please try again.');
    } finally {
      setIsSyncingReactions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AnimatedLogo size="small" showText={false} />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {user.displayName || user.email}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as AdminTab);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-r-2 border-rose-600 dark:border-rose-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {navigationItems.find(item => item.id === activeTab)?.label || 'Admin Dashboard'}
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
                    {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Overview of your content and engagement
                </p>
              </div>
              
                            {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl shadow-lg p-6 border border-blue-200 dark:border-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalPosts}</p>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      +{analytics.recentPosts} this week
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl shadow-lg p-6 border border-green-200 dark:border-green-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">{analytics.totalComments}</p>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Comments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {analytics.avgCommentsPerPost} avg per post
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 rounded-2xl shadow-lg p-6 border border-rose-200 dark:border-rose-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl shadow-lg">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{analytics.totalReactions}</p>
                      <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Total Reactions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-200 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                      {analytics.avgReactionsPerPost} avg per post
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl shadow-lg p-6 border border-purple-200 dark:border-purple-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {((analytics.totalReactions + analytics.totalComments) / Math.max(analytics.totalPosts, 1)).toFixed(1)}
                      </p>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Engagement Rate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      interactions per post
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Tools Section */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    Admin Tools
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSyncCommentCounts}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSyncing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Sync Comment Counts
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSyncReactionCounts}
                    disabled={isSyncingReactions}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/30 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSyncingReactions ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600"></div>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" />
                        Sync Reaction Counts
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  Use these tools to fix any inconsistencies between displayed counts and actual numbers in the database.
                </p>
              </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  Recent Posts
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Last 5 posts
                </span>
              </div>
              <div className="space-y-3">
                {posts.slice(0, 5).map((post, index) => (
                  <div key={post.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-600 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-200">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h4>
                      <div 
                        className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1"
                        dangerouslySetInnerHTML={{ __html: formatContentForContext(post.content, 'card') }}
                      />
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {post.mood}
                        </span>
                        <div className="flex gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg">
                        <Heart className="h-4 w-4" />
                        <span className="font-medium">{Object.values(post.reactions).reduce((a, b) => a + b, 0)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">{post.commentCount || 0}</span>
                      </div>
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
            {/* Page Header */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and moderate your content
              </p>
            </div>
            {/* Enhanced Search and Filter */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border border-blue-100 dark:border-gray-600">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Posts
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, content, or tags..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'reactions' | 'comments')}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  >
                    <option value="date">📅 Latest First</option>
                    <option value="reactions">❤️ Most Reactions</option>
                    <option value="comments">💬 Most Comments</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {sortedPosts.length} posts found
                </span>
                {searchQuery && (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                         Filtered by: &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </div>
            </div>

            {/* Enhanced Posts List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    All Posts ({sortedPosts.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      {loadingData ? 'Loading...' : 'Updated'}
                    </span>
                  </div>
                </div>
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
                    <div key={post.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">{post.title}</h4>
                          <div 
                            className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: formatContentForContext(post.content, 'card') }}
                          />
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="whitespace-nowrap flex items-center gap-1">
                              {new Date(post.createdAt) > new Date() && (
                                <Clock className="h-3 w-3 text-blue-500" />
                              )}
                              {new Date(post.createdAt).toLocaleDateString()}
                              {new Date(post.createdAt) > new Date() && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Scheduled</span>
                              )}
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Heart className="h-4 w-4" />
                              {Object.values(post.reactions).reduce((a, b) => a + b, 0)}
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <MessageSquare className="h-4 w-4" />
                              {post.commentCount || 0}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs whitespace-nowrap">
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                                  +{post.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-start">
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
            {/* Page Header */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comments Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor and moderate user comments
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Comments ({comments.length})
                  </h3>
                  {/* Test button for development */}
                  {process.env.NODE_ENV === 'development' && posts.length > 0 && (
                    <button
                      onClick={async () => {
                        try {
                          await createAuthorReply({
                            postId: posts[0].id,
                            text: "This is a test author reply to verify the functionality works correctly.",
                            ipHash: user?.email || 'admin'
                          });
                          await loadData();
                          alert('Test author reply created!');
                        } catch (error) {
                          console.error('Error creating test reply:', error);
                          alert('Failed to create test reply');
                        }
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Create Test Author Reply
                    </button>
                  )}
                </div>
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
                      <div key={comment.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                              <p className="text-gray-900 dark:text-white break-words flex-1">{comment.text}</p>
                              {comment.isAuthorReply && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex-shrink-0">
                                  Author
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="whitespace-nowrap">{new Date(comment.createdAt).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <Heart className="h-4 w-4" />
                                {Object.values(comment.reactions).reduce((a, b) => a + b, 0)}
                              </span>
                              {post && (
                                <span className="text-blue-600 dark:text-blue-400 truncate">
                                  on &ldquo;{post.title}&rdquo;
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 self-start">
                            {!comment.isAuthorReply && (
                              <button
                                onClick={() => handleReplyToComment(comment.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                title="Reply as author"
                              >
                                <Reply className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                              title="Delete comment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Reply Form */}
                        {replyingToComment === comment.id && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                Replying as Author
                              </span>
                            </div>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply as the author..."
                              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={3}
                            />
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                onClick={handleCancelReply}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment.id, comment.postId)}
                                disabled={!replyText.trim() || isSubmittingReply}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="h-4 w-4" />
                                {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                              </button>
                            </div>
                          </div>
                        )}
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
          <div className="space-y-6">
            {/* Page Header */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Insights and performance metrics
              </p>
            </div>
            <AdminAnalytics posts={posts} comments={comments} />
          </div>
        )}

        {/* Trash Tab */}
        {activeTab === 'trash' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trash</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage deleted content
              </p>
            </div>
            <TrashManager onDataChange={loadData} />
          </div>
        )}

        {/* Create/Edit Post Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingPost ? 'Edit Story' : 'Create New Story'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {editingPost ? 'Update your story content' : 'Share a new story with your community'}
              </p>
            </div>

            {/* AI Features Info */}
            {!editingPost && speechSupported && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg p-6 border border-purple-200 dark:border-purple-700 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    AI-Powered Post Creation
                  </h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    NEW
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Use voice input in English or Hindi, get automatic mood detection, tag suggestions, and title generation powered by AI.
                </p>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  {editingPost ? 'Edit Story' : 'Create New Story'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {editingPost ? 'Update your story content and settings' : 'Share your thoughts and experiences with the community'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {editingPost && (
                  <button
                    onClick={() => {
                      setEditingPost(null);
                      setPostForm({ title: '', content: '', tags: '', mood: 'hopeful', date: new Date().toISOString().slice(0, 16) });
                    }}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all duration-200 font-medium"
                >
                  {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  {suggestedTitle && !postForm.title.trim() && (
                    <button
                      type="button"
                      onClick={applySuggestedTitle}
                      className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" />
                      Use AI suggestion
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder={suggestedTitle || "Enter story title..."}
                  required
                />
                {suggestedTitle && !postForm.title.trim() && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 AI suggested: &quot;{suggestedTitle}&quot;
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <div className="relative">
                  {/* Rich Text Editor */}
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <MDEditor
                      value={postForm.content}
                      onChange={(value) => {
                        const newContent = value || '';
                        setPostForm({ ...postForm, content: newContent });
                        analyzeContent(newContent);
                      }}
                      preview="edit"
                      hideToolbar={false}
                      visibleDragbar={false}
                      textareaProps={{
                        placeholder: 'Share your story... Use the toolbar above for formatting or voice input.',
                        style: {
                          fontSize: 14,
                          lineHeight: 1.6,
                          fontFamily: 'inherit',
                          minHeight: '200px'
                        }
                      }}
                      height={300}
                    />
                  </div>
                  
                  {/* Voice Input Integration */}
                  {speechSupported && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <select
                          value={currentLanguage}
                          onChange={(e) => setCurrentLanguage(e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          disabled={isListening}
                        >
                          {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>
                              {lang.flag} {lang.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isListening 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                          }`}
                          disabled={isSubmitting}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-3 w-3" />
                              Stop Voice
                            </>
                          ) : (
                            <>
                              <Mic className="h-3 w-3" />
                              Voice Input
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {postForm.content.length} characters
                      </div>
                    </div>
                  )}
                </div>
                {/* Voice and AI Status */}
                <div className="mt-2 space-y-1">
                  {isListening && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span>🎤 Listening... Speak now (voice will be added to your content)</span>
                    </div>
                  )}
                  {speechError && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>{speechError}</span>
                    </div>
                  )}
                  {detectedMood && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      🤖 AI detected mood: <span className="font-medium capitalize">{detectedMood}</span>
                    </div>
                  )}
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tags (comma-separated)
                    </label>
                    {suggestedTags.length > 0 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {suggestedTags.length} AI suggestions
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={postForm.tags}
                    onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="healing, hope, resilience"
                  />
                  {suggestedTags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">🤖 AI suggested tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags.map((tag, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addSuggestedTag(tag)}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mood
                    </label>
                    {detectedMood && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        🤖 AI detected: {detectedMood}
                      </span>
                    )}
                  </div>
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
                    <option value="happy">Happy</option>
                    <option value="angry">Angry</option>
                    <option value="nostalgic">Nostalgic</option>
                  </select>
                </div>
              </div>

              {/* Date and Time Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Post Date & Time
                  </label>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(postForm.date) > new Date() ? (
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Clock className="h-3 w-3" />
                        Scheduled for future
                      </span>
                    ) : new Date(postForm.date).toDateString() === new Date().toDateString() ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Clock className="h-3 w-3" />
                        Publishing today
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Clock className="h-3 w-3" />
                        Backdated post
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <input
                      type="datetime-local"
                      value={postForm.date}
                      onChange={(e) => setPostForm({ ...postForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPostForm({ ...postForm, date: new Date().toISOString().slice(0, 16) })}
                      className="flex-1 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
                        setPostForm({ ...postForm, date: tomorrow.toISOString().slice(0, 16) });
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You can post in the past, present, or schedule for the future. Future posts will be published automatically.
                </p>
              </div>

                              <button
                type="submit"
                disabled={isSubmitting || !postForm.title.trim() || !postForm.content.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                  new Date(postForm.date) > new Date() 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? (
                  editingPost ? 'Updating...' : 'Publishing...'
                ) : editingPost ? (
                  'Update Story'
                ) : new Date(postForm.date) > new Date() ? (
                  'Schedule Story'
                ) : (
                  'Publish Story'
                )}
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
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 prose prose-sm max-w-none">
                    <div 
                      className="markdown-preview"
                      dangerouslySetInnerHTML={{ __html: formatContentForContext(postForm.content, 'full') }}
                    />
                  </div>
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
          </div>
        )}
        </div>
      </div>
    </div>
  );
} 