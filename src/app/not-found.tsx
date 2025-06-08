import { Metadata } from 'next';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found | Kahani Roz',
  description: 'The page you are looking for could not be found. Explore our collection of inspiring daily stories instead.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-rose-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Story Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The story you&apos;re looking for seems to have wandered off. Let&apos;s help you find your way back to inspiring tales.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors duration-200 gap-2"
          >
            <Home className="h-5 w-5" />
            Back to Stories
          </Link>
          
          <Link
            href="/?search=inspiration"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 gap-2"
          >
            <Search className="h-5 w-5" />
            Search Stories
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Popular Story Categories
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {['healing', 'hope', 'resilience', 'growth', 'mindfulness'].map((tag) => (
              <Link
                key={tag}
                href={`/?tags=${tag}`}
                className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-sm hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors duration-200 capitalize"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 