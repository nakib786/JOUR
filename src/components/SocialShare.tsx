'use client';

import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { trackShare } from '@/lib/sharing';

interface SocialShareProps {
  title: string;
  content: string;
  url?: string;
  tags?: string[];
  className?: string;
  postId?: string;
  onShare?: () => void;
}

// SVG Icons for social media platforms
const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 667 667" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M75 0C33 0 0 33 0 75v517c0 42 33 75 75 75h517c42 0 75-33 75-75V75c0-42-33-75-75-75H75zm615 667c0 42-33 75-75 75H534V613H404v-151h130V350c0-129 79-199 195-199 55 0 102 4 116 6v135h-80c-63 0-75 30-75 73v92h150l-20 151H690v387z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const RedditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12.013C24.007 5.367 18.641.001.012.001z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.74-1.811-.365-.479-.833-.84-1.398-1.077-.581-.244-1.262-.365-2.034-.365-1.199 0-2.326.275-3.355.818l-.949-1.766c1.25-.659 2.777-1.052 4.304-1.052 1.043 0 2.002.175 2.85.519.848.344 1.568.852 2.142 1.517.573.665.96 1.477 1.15 2.417.387.019.757.045 1.114.08 1.768.175 3.267.586 4.264 1.527.492.464.793 1.077.919 1.823.127.747.132 1.448-.02 2.085-.36 1.506-1.299 2.747-2.734 3.596-1.414.836-3.206 1.263-5.319 1.271-.926-.009-1.758-.064-2.701-.673zm1.012-11.69c-.097 0-.192.007-.287.021-1.07.09-1.914.405-2.45.913-.537.508-.746 1.093-.71 1.69.04.69.417 1.267.975 1.644.558.378 1.283.548 2.095.548.825 0 1.456-.213 1.875-.633.419-.42.684-.98.684-1.69 0-.710-.265-1.27-.684-1.69-.419-.42-1.05-.633-1.875-.633-.097 0-.192.007-.287.021z"/>
  </svg>
);

const socialPlatforms = [
  {
    name: 'X (Twitter)',
    icon: <TwitterIcon />,
    color: 'bg-black hover:bg-gray-800',
    getUrl: (title: string, content: string, url: string, tags: string[]) => {
      const text = `${title}\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`;
      const hashtags = tags.map(tag => tag.replace(/\s+/g, '')).join(' #');
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
    }
  },
  {
    name: 'Threads',
    icon: <ThreadsIcon />,
    color: 'bg-black hover:bg-gray-800',
    getUrl: (title: string, content: string, url: string) => {
      const text = `${title}\n\n${content.substring(0, 300)}${content.length > 300 ? '...' : ''}\n\n${url}`;
      return `https://threads.net/intent/post?text=${encodeURIComponent(text)}`;
    }
  },
  {
    name: 'LinkedIn',
    icon: <LinkedInIcon />,
    color: 'bg-blue-600 hover:bg-blue-700',
    getUrl: (title: string, content: string, url: string) => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(content.substring(0, 200))}`;
    }
  },
  {
    name: 'Facebook',
    icon: <FacebookIcon />,
    color: 'bg-blue-500 hover:bg-blue-600',
    getUrl: (title: string, content: string, url: string) => {
      // Using the simpler Facebook sharing URL that works better for link retention
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }
  },
  {
    name: 'WhatsApp',
    icon: <WhatsAppIcon />,
    color: 'bg-green-500 hover:bg-green-600',
    getUrl: (title: string, content: string, url: string) => {
      const text = `*${title}*\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n${url}`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    }
  },
  {
    name: 'Telegram',
    icon: <TelegramIcon />,
    color: 'bg-blue-400 hover:bg-blue-500',
    getUrl: (title: string, content: string, url: string) => {
      const text = `${title}\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n${url}`;
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    }
  },
  {
    name: 'Reddit',
    icon: <RedditIcon />,
    color: 'bg-orange-500 hover:bg-orange-600',
    getUrl: (title: string, content: string, url: string) => {
      return `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    }
  },
  {
    name: 'Pinterest',
    icon: <PinterestIcon />,
    color: 'bg-red-500 hover:bg-red-600',
    getUrl: (title: string, content: string, url: string) => {
      return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(`${title}\n\n${content.substring(0, 200)}`)}`;
    }
  },
  {
    name: 'Instagram',
    icon: <InstagramIcon />,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    getUrl: (title: string, content: string, url: string) => {
      // Instagram doesn't have direct web sharing, so we'll copy content for manual sharing
      const instagramText = `${title}\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n${url}\n\n#journal #mentalhealth #story`;
      return `data:text/plain;charset=utf-8,${encodeURIComponent(instagramText)}`;
    }
  }
];

export function SocialShare({ title, content, url, tags = [], className = '', postId, onShare }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate the full URL for sharing
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  // Clean content for sharing (remove HTML tags)
  const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  const handleShare = async (platform: typeof socialPlatforms[0]) => {
    const shareLink = platform.getUrl(title, cleanContent, shareUrl, tags);
    
    // Track the share event
    trackShare(platform.name.toLowerCase().replace(/\s+/g, '_'), 'post', postId || shareUrl.split('/').pop() || '');
    
    // Call the onShare callback to increment share count
    onShare?.();
    
    // Special handling for Instagram
    if (platform.name === 'Instagram') {
      try {
        const instagramText = `${title}\n\n${cleanContent.substring(0, 200)}${cleanContent.length > 200 ? '...' : ''}\n\n${shareUrl}\n\n#journal #mentalhealth #story`;
        await navigator.clipboard.writeText(instagramText);
        alert('Content copied to clipboard! You can now paste it in Instagram.');
      } catch (err) {
        console.error('Failed to copy Instagram content:', err);
        // Fallback: show the content in a new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Instagram Content</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Copy this content for Instagram:</h2>
                <textarea style="width: 100%; height: 200px; padding: 10px;" readonly>${`${title}\n\n${cleanContent.substring(0, 200)}${cleanContent.length > 200 ? '...' : ''}\n\n${shareUrl}\n\n#journal #mentalhealth #story`}</textarea>
                <p>Copy the text above and paste it into your Instagram post.</p>
              </body>
            </html>
          `);
        }
      }
    } else {
      window.open(shareLink, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
    
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: cleanContent.substring(0, 200),
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200"
        title="Share this post"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share this post
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Social Platform Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4 max-h-64 overflow-y-auto">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handleShare(platform)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors duration-200 ${platform.color}`}
                >
                  <span className="flex-shrink-0">{platform.icon}</span>
                  <span className="truncate">{platform.name}</span>
                </button>
              ))}
            </div>

            {/* Native Share (Mobile) */}
            {typeof window !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 mb-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors duration-200"
              >
                <Share2 className="h-4 w-4" />
                <span>More sharing options</span>
              </button>
            )}

            {/* Copy Link */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 