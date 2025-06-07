import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

// Configure marked for better security and formatting
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
});

/**
 * Enhanced rich text formatter that handles both markdown and custom patterns
 */
export function formatRichText(content: string, options: {
  allowMarkdown?: boolean;
  allowCustomFormatting?: boolean;
  context?: 'full' | 'preview' | 'card';
} = {}): string {
  const {
    allowMarkdown = true,
    allowCustomFormatting = true,
    context = 'full'
  } = options;

  if (!content) return '';

  let formatted = content;

  // First, handle markdown if enabled
  if (allowMarkdown) {
    // Check if content contains markdown syntax
    const hasMarkdown = /[*_`#\[\]]/.test(content);
    
    if (hasMarkdown) {
      try {
        formatted = marked(content) as string;
        // Remove wrapping <p> tags if they exist
        formatted = formatted.replace(/^<p>([\s\S]*)<\/p>$/, '$1');
      } catch (error) {
        console.warn('Markdown parsing failed, falling back to plain text:', error);
      }
    }
  }

  // Apply custom formatting patterns if enabled
  if (allowCustomFormatting) {
    formatted = applyCustomFormatting(formatted);
  }

  // Apply context-specific truncation
  if (context === 'preview') {
    formatted = truncateForPreview(formatted, 200);
  } else if (context === 'card') {
    formatted = truncateForPreview(formatted, 100);
  }

  // Sanitize the HTML to prevent XSS
  return DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'span', 'div', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false
  });
}

/**
 * Apply custom formatting patterns for enhanced text display
 */
function applyCustomFormatting(content: string): string {
  let formatted = content;

  // Convert line breaks to HTML (if not already converted by markdown)
  if (!formatted.includes('<br>') && !formatted.includes('<p>')) {
    formatted = formatted.replace(/\n/g, '<br>');
  }

  // Use a more compatible approach - process in order and use placeholders to avoid conflicts
  
  // Step 1: Protect existing HTML content with placeholders
  const htmlProtectionMap = new Map<string, string>();
  let protectionCounter = 0;
  
  // Protect existing HTML tags and attributes
  formatted = formatted.replace(/<[^>]*>/g, (match) => {
    const placeholder = `__HTML_PROTECTED_${protectionCounter++}__`;
    htmlProtectionMap.set(placeholder, match);
    return placeholder;
  });

  // Step 2: Format URLs first (most specific)
  formatted = formatted.replace(
    /(https?:\/\/[^\s<>"]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">$1</a>'
  );

  // Step 3: Format email addresses (before mentions to avoid @domain conflicts)
  formatted = formatted.replace(
    /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    '<a href="mailto:$1" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">$1</a>'
  );

  // Step 4: Format hashtags
  formatted = formatted.replace(
    /\B#(\w+)/g,
    '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 mr-1">#$1</span>'
  );

  // Step 5: Format mentions (@username) - but avoid email domains
  // Use word boundary and negative lookahead to avoid email domains
  formatted = formatted.replace(
    /\B@(\w+)(?!\.[a-zA-Z])/g,
    '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 mr-1">@$1</span>'
  );

  // Step 6: Format bold text (**text**) - only if not already processed by markdown
  if (!formatted.includes('<strong>')) {
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>'
    );
  }

  // Step 7: Format italic text (*text*) - only if not already processed by markdown
  if (!formatted.includes('<em>')) {
    formatted = formatted.replace(
      /\*(.*?)\*/g,
      '<em class="italic text-gray-800 dark:text-gray-200">$1</em>'
    );
  }

  // Step 8: Format quotes ("text")
  formatted = formatted.replace(
    /"([^"<>]+)"/g,
    '<span class="italic text-gray-700 dark:text-gray-300 border-l-2 border-gray-300 dark:border-gray-600 pl-2 ml-2">"$1"</span>'
  );

  // Step 9: Format time stamps (HH:MM format)
  formatted = formatted.replace(
    /\b(\d{1,2}:\d{2}(?:\s?[AaPp][Mm])?)\b/g,
    '<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">🕐 $1</span>'
  );

  // Step 10: Format dates (DD/MM/YYYY or DD-MM-YYYY)
  formatted = formatted.replace(
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/g,
    '<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">📅 $1</span>'
  );

  // Step 11: Format phone numbers (basic pattern)
  formatted = formatted.replace(
    /\b(\+?[\d\s\-\(\)]{10,})\b/g,
    '<span class="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</span>'
  );

  // Step 12: Format emotions/emojis in text
  const emotionMap: Record<string, string> = {
    ':)': '😊',
    ':-)': '😊',
    ':(': '😢',
    ':-(': '😢',
    ':D': '😃',
    ':-D': '😃',
    ';)': '😉',
    ';-)': '😉',
    ':P': '😛',
    ':-P': '😛',
    ':o': '😮',
    ':-o': '😮',
    '<3': '❤️',
    '</3': '💔'
  };

  Object.entries(emotionMap).forEach(([text, emoji]) => {
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    formatted = formatted.replace(new RegExp(`\\b${escapedText}\\b`, 'g'), emoji);
  });

  // Step 13: Format numbered lists (only if not already processed by markdown)
  if (!formatted.includes('<ol>') && !formatted.includes('<ul>')) {
    formatted = formatted.replace(
      /^(\d+)\.\s(.+)$/gm,
      '<div class="flex items-start gap-2 my-1"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">$1</span><span>$2</span></div>'
    );

    // Format bullet points
    formatted = formatted.replace(
      /^[\-\*]\s(.+)$/gm,
      '<div class="flex items-start gap-2 my-1"><span class="text-gray-500 dark:text-gray-400 mt-1">•</span><span>$1</span></div>'
    );
  }

  // Step 14: Restore protected HTML content
  htmlProtectionMap.forEach((originalHtml, placeholder) => {
    formatted = formatted.replace(placeholder, originalHtml);
  });

  return formatted;
}

/**
 * Truncate formatted content for preview contexts
 */
function truncateForPreview(content: string, maxLength: number): string {
  // Remove HTML tags for length calculation
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
  
  if (plainText.length <= maxLength) {
    return content;
  }

  // Find a good truncation point
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const cutPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;
  
  return plainText.substring(0, cutPoint).trim() + '...';
}

/**
 * Extract plain text from rich content for search and sharing
 */
export function extractPlainText(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Check if content contains markdown syntax
 */
export function hasMarkdownSyntax(content: string): boolean {
  return /[*_`#\[\]]/.test(content);
}

/**
 * Convert markdown to plain text (for storage optimization)
 */
export function markdownToPlainText(content: string): string {
  return content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .trim();
} 