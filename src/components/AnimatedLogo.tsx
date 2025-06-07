'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles, Star } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export function AnimatedLogo({ size = 'medium', showText = true, className = '' }: AnimatedLogoProps) {
  const sizeConfig = {
    small: {
      heart: 'h-8 w-8',
      sparkles: 'h-4 w-4',
      star: 'h-3 w-3',
      text: 'text-lg',
      subtitle: 'text-xs'
    },
    medium: {
      heart: 'h-12 w-12',
      sparkles: 'h-6 w-6',
      star: 'h-4 w-4',
      text: 'text-xl',
      subtitle: 'text-sm'
    },
    large: {
      heart: 'h-24 w-24',
      sparkles: 'h-10 w-10',
      star: 'h-6 w-6',
      text: 'text-3xl',
      subtitle: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Animated Logo */}
      <motion.div 
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart className={`${config.heart} text-rose-500 drop-shadow-lg`} />
        </motion.div>
        
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Sparkles className={`${config.sparkles} text-pink-400`} />
        </motion.div>
        
        <motion.div
          className="absolute -bottom-1 -left-1"
          animate={{ 
            y: [0, -5, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Star className={`${config.star} text-purple-400`} />
        </motion.div>
      </motion.div>

      {/* Text */}
      {showText && (
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className={`${config.text} font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent`}>
            Kahani Roz
          </span>
          <span className={`${config.subtitle} text-gray-500 dark:text-gray-400 -mt-1`}>
            A Story Every Day
          </span>
        </motion.div>
      )}
    </div>
  );
} 