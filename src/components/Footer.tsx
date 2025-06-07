'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Heart, Quote } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';
import { SubscriptionModal } from './SubscriptionModal';

const inspirationalQuotes = [
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers"
  },
  {
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: "Unknown"
  },
  {
    text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    author: "Steve Jobs"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Try to be a rainbow in someone else's cloud.",
    author: "Maya Angelou"
  },
  {
    text: "Keep your face always toward the sunshine—and shadows will fall behind you.",
    author: "Walt Whitman"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown"
  },
  {
    text: "Great things never come from comfort zones.",
    author: "Unknown"
  },
  {
    text: "Dream it. Wish it. Do it.",
    author: "Unknown"
  },
  {
    text: "Success doesn't just find you. You have to go out and get it.",
    author: "Unknown"
  },
  {
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown"
  },
  {
    text: "Dream bigger. Do bigger.",
    author: "Unknown"
  },
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    author: "Unknown"
  },
  {
    text: "Wake up with determination. Go to bed with satisfaction.",
    author: "Unknown"
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery"
  },
  {
    text: "Little things make big days.",
    author: "Unknown"
  },
  {
    text: "It's going to be hard, but hard does not mean impossible.",
    author: "Unknown"
  },
  {
    text: "Don't wait for opportunity. Create it.",
    author: "Unknown"
  },
  {
    text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    author: "Unknown"
  },
  {
    text: "The key to success is to focus on goals, not obstacles.",
    author: "Unknown"
  },
  {
    text: "Dream it. Believe it. Build it.",
    author: "Unknown"
  }
];

export function Footer() {
  const [isDark, setIsDark] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    // Rotate quotes every 5 seconds
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => 
        (prevIndex + 1) % inspirationalQuotes.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const currentQuote = inspirationalQuotes[currentQuoteIndex];

  return (
    <footer className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-rose-100 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quote Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Quote className="h-8 w-8 text-rose-400 dark:text-rose-300" />
          </div>
          <blockquote className="text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed">
            &ldquo;{currentQuote.text}&rdquo;
          </blockquote>
          <cite className="text-rose-600 dark:text-rose-400 font-semibold text-base">
            — {currentQuote.author}
          </cite>
          
          {/* Quote Indicator Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {inspirationalQuotes.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuoteIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentQuoteIndex % 5
                    ? 'bg-rose-500 dark:bg-rose-400'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to quote ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-8">
          {/* Logo Section */}
          <div className="flex justify-center md:justify-start">
            <AnimatedLogo size="medium" />
          </div>

          {/* Subscribe Button - Center */}
          <div className="flex justify-center">
            <button 
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-rose-200 dark:focus:ring-rose-800"
            >
              Subscribe
            </button>
          </div>

          {/* Theme Toggle - Right */}
          <div className="flex items-center justify-center md:justify-end space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block font-medium">
              Theme
            </span>
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-4 focus:ring-rose-200 dark:focus:ring-rose-800"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center pt-8 border-t border-rose-100 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center flex-wrap gap-1">
            <span>© {new Date().getFullYear()} Kahani Roz. Made with</span>
            <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
            <span>for storytellers everywhere.</span>
          </p>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </footer>
  );
} 