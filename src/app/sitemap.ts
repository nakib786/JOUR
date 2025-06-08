import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kahaniroz.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ];

  try {
    // Get all posts for dynamic pages
    const posts = await getPosts({ limitCount: 1000 });
    
    const postPages = posts.map((post) => ({
      url: `${baseUrl}/post/${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...postPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if there's an error fetching posts
    return staticPages;
  }
} 