export const SEO_CONFIG = {
  siteName: 'Kahani Roz',
  siteUrl: 'https://kahaniroz.com',
  defaultTitle: 'Kahani Roz - A Story Every Day | Real Life Stories & Daily Inspiration',
  defaultDescription: 'Discover inspiring real-life stories every day on Kahani Roz. Share your journey, read authentic experiences, and connect through anonymous storytelling. Mental health, personal growth, and daily inspiration await.',
  defaultKeywords: [
    'daily stories',
    'real life stories', 
    'personal experiences',
    'mental health stories',
    'inspiration',
    'journal entries',
    'anonymous storytelling',
    'life experiences',
    'personal growth',
    'healing stories',
    'authentic stories',
    'daily inspiration',
    'emotional wellness',
    'self care stories',
    'vulnerability',
    'hope stories',
    'resilience',
    'mindfulness',
    'gratitude',
    'life lessons'
  ],
  author: 'Kahani Roz Community',
  twitterHandle: '@kahaniroz',
  ogImage: '/og-image.jpg',
  locale: 'en_US',
  type: 'website',
};

export const generatePageTitle = (title?: string): string => {
  if (!title) return SEO_CONFIG.defaultTitle;
  return `${title} | ${SEO_CONFIG.siteName}`;
};

export const generatePageUrl = (path: string): string => {
  return `${SEO_CONFIG.siteUrl}${path}`;
};

export const generatePostKeywords = (tags: string[], mood?: string): string[] => {
  const baseKeywords = [
    'real life story',
    'personal experience', 
    'daily inspiration',
    'mental health',
    'authentic story'
  ];
  
  if (mood) {
    baseKeywords.push(mood);
  }
  
  return [...tags, ...baseKeywords];
};

export const truncateDescription = (content: string, maxLength: number = 160): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3) + '...';
};

export const generateBreadcrumbJsonLd = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const generateOrganizationJsonLd = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${SEO_CONFIG.siteUrl}/logo.png`,
      "width": 512,
      "height": 512
    },
    "description": SEO_CONFIG.defaultDescription,
    "sameAs": [
      `https://twitter.com/${SEO_CONFIG.twitterHandle.replace('@', '')}`
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };
}; 