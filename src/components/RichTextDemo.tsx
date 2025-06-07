'use client';

import { useState } from 'react';
import { formatRichText } from '@/lib/richTextFormatter';

export function RichTextDemo() {
  const [content, setContent] = useState(`# Rich Text Demo

This is a **bold** text and this is *italic*.

Contact nshaikh@bclc.com or @bclc for help

Check out this link: https://example.com
Email me at: test@example.com

#technology #friends @mention

"This is a quoted text"

Here's a list:
1. First item
2. Second item
- Bullet point
- Another bullet

Time: 14:30
Date: 25/12/2023

Emotions: :) :D <3`);

  const formattedContent = formatRichText(content, {
    allowMarkdown: true,
    allowCustomFormatting: true,
    context: 'full'
  });

  // Test specific problematic input
  const problematicInput = 'Contact nshaikh@bclc.com or @bclc for help #technology #friends';
  const problematicOutput = formatRichText(problematicInput, {
    allowMarkdown: true,
    allowCustomFormatting: true,
    context: 'full'
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rich Text Formatting Demo</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Input (Markdown + Custom)</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            placeholder="Type your content here..."
          />
        </div>
        
        {/* Output */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Formatted Output</h3>
          <div 
            className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-auto prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>
      </div>
      
      {/* Context Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Debug: Problematic Input Test</h3>
        <div className="p-4 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
          <h4 className="font-medium mb-2 text-red-700 dark:text-red-300">Input: {problematicInput}</h4>
          <div 
            className="text-sm text-red-600 dark:text-red-400 font-mono"
            dangerouslySetInnerHTML={{ __html: problematicOutput }}
          />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Context Examples</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Card Context</h4>
            <div 
              className="text-sm text-gray-600 dark:text-gray-400"
              dangerouslySetInnerHTML={{ 
                __html: formatRichText(content, { context: 'card' }) 
              }}
            />
          </div>
          
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Preview Context</h4>
            <div 
              className="text-sm text-gray-600 dark:text-gray-400"
              dangerouslySetInnerHTML={{ 
                __html: formatRichText(content, { context: 'preview' }) 
              }}
            />
          </div>
          
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Full Context</h4>
            <div 
              className="text-sm text-gray-600 dark:text-gray-400 max-h-32 overflow-auto"
              dangerouslySetInnerHTML={{ 
                __html: formatRichText(content, { context: 'full' }) 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 