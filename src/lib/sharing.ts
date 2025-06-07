import { Post, Comment } from '@/types';

export interface ShareContent {
  title: string;
  description: string;
  url: string;
  hashtags: string[];
  image?: string;
}

/**
 * Generate optimized sharing content for a post
 */
export function generatePostShareContent(post: Post, baseUrl?: string): ShareContent {
  const url = baseUrl ? `${baseUrl}/post/${post.id}` : 
    (typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '');
  
  // Clean and optimize content for sharing
  const cleanContent = post.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Generate description with optimal length for social media
  const description = cleanContent.length > 280 
    ? `${cleanContent.substring(0, 277)}...` 
    : cleanContent;
  
  // Optimize hashtags for social sharing
  const hashtags = [
    ...post.tags.map(tag => tag.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')),
    'journal',
    'mentalhealth',
    post.mood
  ].filter(Boolean);

  return {
    title: post.title,
    description,
    url,
    hashtags,
  };
}

/**
 * Generate optimized sharing content for a comment
 */
export function generateCommentShareContent(comment: Comment, baseUrl?: string): ShareContent {
  const url = baseUrl ? `${baseUrl}/comment/${comment.id}` : 
    (typeof window !== 'undefined' ? `${window.location.origin}/comment/${comment.id}` : '');
  
  const cleanContent = comment.text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const title = cleanContent.length > 50 
    ? `"${cleanContent.substring(0, 47)}..."` 
    : `"${cleanContent}"`;
  
  const description = `Thoughtful comment: ${cleanContent}`;

  return {
    title,
    description,
    url,
    hashtags: ['comment', 'discussion', 'community'],
  };
}

/**
 * Platform-specific content optimization
 */
export const platformOptimizers = {
  twitter: (content: ShareContent) => ({
    text: `${content.title}\n\n${content.description.substring(0, 200)}`,
    hashtags: content.hashtags.slice(0, 3), // Twitter works best with 1-3 hashtags
    url: content.url
  }),
  
  linkedin: (content: ShareContent) => ({
    title: content.title,
    summary: content.description.substring(0, 200),
    url: content.url
  }),
  
  facebook: (content: ShareContent) => ({
    quote: `${content.title}\n\n${content.description}`,
    url: content.url
  }),
  
  instagram: (content: ShareContent) => ({
    caption: `${content.title}\n\n${content.description}\n\n${content.hashtags.map(tag => `#${tag}`).join(' ')}`,
    url: content.url
  }),
  
  whatsapp: (content: ShareContent) => ({
    text: `*${content.title}*\n\n${content.description}\n\n${content.url}`
  }),
  
  telegram: (content: ShareContent) => ({
    text: `${content.title}\n\n${content.description}`,
    url: content.url
  }),
  
  threads: (content: ShareContent) => ({
    text: `${content.title}\n\n${content.description.substring(0, 300)}\n\n${content.url}`
  }),
  
  reddit: (content: ShareContent) => ({
    title: content.title,
    url: content.url
  }),
  
  pinterest: (content: ShareContent) => ({
    description: `${content.title}\n\n${content.description}`,
    url: content.url
  })
};

/**
 * Generate sharing URLs for different platforms
 */
export function generateSharingUrls(content: ShareContent) {
  const optimized = {
    twitter: platformOptimizers.twitter(content),
    linkedin: platformOptimizers.linkedin(content),
    facebook: platformOptimizers.facebook(content),
    whatsapp: platformOptimizers.whatsapp(content),
    telegram: platformOptimizers.telegram(content),
    threads: platformOptimizers.threads(content),
    reddit: platformOptimizers.reddit(content),
    pinterest: platformOptimizers.pinterest(content)
  };

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(optimized.twitter.text)}&url=${encodeURIComponent(optimized.twitter.url)}&hashtags=${encodeURIComponent(optimized.twitter.hashtags.join(','))}`,
    
    threads: `https://threads.net/intent/post?text=${encodeURIComponent(optimized.threads.text)}`,
    
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(optimized.linkedin.url)}&title=${encodeURIComponent(optimized.linkedin.title)}&summary=${encodeURIComponent(optimized.linkedin.summary)}`,
    
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(optimized.facebook.url)}&quote=${encodeURIComponent(optimized.facebook.quote)}`,
    
    whatsapp: `https://wa.me/?text=${encodeURIComponent(optimized.whatsapp.text)}`,
    
    telegram: `https://t.me/share/url?url=${encodeURIComponent(optimized.telegram.url)}&text=${encodeURIComponent(optimized.telegram.text)}`,
    
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(optimized.reddit.url)}&title=${encodeURIComponent(optimized.reddit.title)}`,
    
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(optimized.pinterest.url)}&description=${encodeURIComponent(optimized.pinterest.description)}`
  };
}

/**
 * Track sharing analytics (you can integrate with your analytics service)
 */
export function trackShare(platform: string, contentType: 'post' | 'comment', contentId: string) {
  // You can integrate with Google Analytics, Mixpanel, or other analytics services
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as { gtag: (command: string, action: string, parameters: Record<string, string>) => void }).gtag;
    gtag('event', 'share', {
      method: platform,
      content_type: contentType,
      content_id: contentId
    });
  }
  
  console.log(`Shared ${contentType} ${contentId} on ${platform}`);
} 