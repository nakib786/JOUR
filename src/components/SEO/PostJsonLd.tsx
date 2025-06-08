interface StructuredData {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  author: {
    "@type": string;
    name: string;
  };
  publisher: {
    "@type": string;
    name: string;
    logo: {
      "@type": string;
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    "@type": string;
    "@id": string;
  };
  keywords: string;
  articleSection: string;
  wordCount: number;
  inLanguage: string;
  isAccessibleForFree: boolean;
  genre: string[];
  audience: {
    "@type": string;
    audienceType: string;
  };
}

interface PostJsonLdProps {
  structuredData: StructuredData;
}

export function PostJsonLd({ structuredData }: PostJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
} 