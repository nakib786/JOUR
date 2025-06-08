interface HomeJsonLdProps {
  postsCount: number;
}

export function HomeJsonLd({ postsCount }: HomeJsonLdProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kahani Roz",
    "alternateName": "Kahani Roz - A Story Every Day",
    "url": "https://kahaniroz.com",
    "description": "Discover inspiring real-life stories every day on Kahani Roz. Share your journey, read authentic experiences, and connect through anonymous storytelling. Mental health, personal growth, and daily inspiration await.",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "publisher": {
      "@type": "Organization",
      "name": "Kahani Roz",
      "url": "https://kahaniroz.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kahaniroz.com/logo.png",
        "width": 512,
        "height": 512
      },
      "sameAs": [
        "https://twitter.com/kahaniroz"
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://kahaniroz.com/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "Blog",
      "name": "Kahani Roz Stories",
      "description": "Daily collection of inspiring real-life stories, personal experiences, and authentic journal entries",
      "blogPost": {
        "@type": "ItemList",
        "numberOfItems": postsCount,
        "itemListElement": "Real-life stories and personal experiences"
      }
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "General Public",
      "geographicArea": {
        "@type": "Place",
        "name": "Worldwide"
      }
    },
    "keywords": "daily stories, real life stories, personal experiences, mental health stories, inspiration, journal entries, anonymous storytelling, life experiences, personal growth, healing stories, authentic stories, daily inspiration, emotional wellness, self care stories, vulnerability, hope stories, resilience, mindfulness, gratitude, life lessons"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
} 