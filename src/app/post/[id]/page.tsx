import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { getPost } from '@/lib/firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PostJsonLd } from '@/components/SEO/PostJsonLd';

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const post = await getPost(id);
    
    if (!post) {
      return {
        title: 'Post Not Found | Kahani Roz',
        description: 'The requested story could not be found.',
      };
    }

    const truncatedContent = post.content.length > 160 
      ? post.content.substring(0, 157) + '...'
      : post.content;

    const postUrl = `https://kahaniroz.com/post/${id}`;

    return {
      title: `${post.title} | Real Life Story`,
      description: truncatedContent,
      keywords: [
        ...post.tags,
        'real life story',
        'personal experience',
        'daily inspiration',
        post.mood,
        'mental health',
        'authentic story'
      ],
      openGraph: {
        title: post.title,
        description: truncatedContent,
        type: 'article',
        url: postUrl,
        siteName: 'Kahani Roz',
        publishedTime: post.createdAt.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        authors: ['Kahani Roz Community'],
        tags: post.tags,
        images: [
          {
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: `${post.title} - Kahani Roz Story`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: truncatedContent,
        images: ['/og-image.jpg'],
      },
      alternates: {
        canonical: postUrl,
      },
      other: {
        'article:author': 'Kahani Roz Community',
        'article:published_time': post.createdAt.toISOString(),
        'article:modified_time': post.updatedAt.toISOString(),
        'article:section': 'Personal Stories',
        'article:tag': post.tags.join(', '),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Story | Kahani Roz',
      description: 'Read inspiring real-life stories on Kahani Roz.',
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  let post;
  const { id } = await params;
  
  try {
    post = await getPost(id);
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }

  if (!post) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.content.length > 160 ? post.content.substring(0, 157) + '...' : post.content,
    "author": {
      "@type": "Organization",
      "name": "Kahani Roz Community"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kahani Roz",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kahaniroz.com/logo.png"
      }
    },
    "datePublished": post.createdAt.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://kahaniroz.com/post/${id}`
    },
    "keywords": post.tags.join(', '),
    "articleSection": "Personal Stories",
    "wordCount": post.content.split(' ').length,
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "genre": ["Personal Development", "Mental Health", "Life Stories"],
    "audience": {
      "@type": "Audience",
      "audienceType": "General Public"
    }
  };

  return (
    <>
      <PostJsonLd structuredData={structuredData} />
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link 
                  href="/" 
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link 
                  href="/" 
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  Stories
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 dark:text-white font-medium" aria-current="page">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 mb-6 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all stories</span>
          </Link>

          {/* Post Content */}
          <article className="space-y-6">
            <header>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <time dateTime={post.createdAt.toISOString()}>
                  {post.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                <span>•</span>
                <span>{post.content.split(' ').length} words</span>
                <span>•</span>
                <span className="capitalize">{post.mood} mood</span>
              </div>
            </header>
            
            <PostCard post={post} />
          </article>

          {/* Related Content Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Explore More Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/?tags=healing"
                className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-rose-200/30 hover:border-rose-300 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">Healing Stories</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stories of recovery and growth</p>
              </Link>
              <Link
                href="/?tags=hope"
                className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-rose-200/30 hover:border-rose-300 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">Hope Stories</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inspiring tales of resilience</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
} 